from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .inpsections import Inspection
from .properties import Property
from django.utils.timezone import now
import base64
import requests, json, os
import mimetypes
from dotenv import load_dotenv
import os

load_dotenv()


ANTHROPIC_API_KEY = "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"
@csrf_exempt
@require_http_methods(["GET"])
def get_properties(request):
    """Return all properties (basic info only)"""
    try:
        props = Property.objects.all()
        data = []

        for p in props:
            # Calculate issue counts from inspections
            from .inpsections import Inspection
            inspections = Inspection.objects.filter(property_id=p.id)
            issue_count = inspections.count()
            critical_count = inspections.filter(concern_level__gte=8).count()
            high_count = inspections.filter(concern_level__gte=6, concern_level__lt=8).count()
            moderate_count = inspections.filter(concern_level__gte=4, concern_level__lt=6).count()
            
            # Calculate estimated repair cost
            total_repair_cost = 0
            for inspection in inspections:
                if inspection.estimated_cost_low and inspection.estimated_cost_high:
                    avg_cost = (float(inspection.estimated_cost_low) + float(inspection.estimated_cost_high)) / 2
                    total_repair_cost += avg_cost
            
            data.append({
                "id": str(p.id),
                "address": p.address,
                "city": p.city or "",
                "state": p.state or "",
                "zipCode": p.zip_code or "",
                "tourDate": p.tour_date.isoformat() if p.tour_date else None,
                "issueCount": issue_count,
                "criticalIssues": critical_count,
                "highIssues": high_count,
                "moderateIssues": moderate_count,
                "imageUrl": p.image_url.replace('/Users/saketh/Desktop/Calhacks/images/', '/images/') if p.image_url else "",
                "grade": p.grade or "B+",
                "estimatedPrice": float(p.estimated_price) if p.estimated_price else 0,
                "listPrice": float(p.estimated_price) if p.estimated_price else 0,  # Using estimated_price as listPrice
                "ourEstimate": float(p.estimated_price) * 0.95 if p.estimated_price else 0,  # 5% below list price
                "estimatedRepairCost": total_repair_cost,
                "createdAt": p.created_at.isoformat(),
                "updatedAt": p.updated_at.isoformat(),
            })

        return JsonResponse({"success": True, "data": data})
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_property_details(request, property_id):
    """Return a single property and its issues"""
    try:
        p = Property.objects.get(id=property_id)
        issues = Inspection.objects.filter(property_id=p.id)

        issue_list = []
        for i in issues:
            issue_list.append({
                "id": str(i.id),
                "propertyId": str(p.id),
                "title": i.title,
                "description": i.description or "",
                "priority": i.priority or "moderate",
                "category": i.category or "General",
                "concernLevel": i.concern_level or 5,
                "estimatedCostLow": float(i.estimated_cost_low) if i.estimated_cost_low else 0,
                "estimatedCostHigh": float(i.estimated_cost_high) if i.estimated_cost_high else 0,
                "imageUrl": i.image_url.replace('/Users/saketh/Desktop/Calhacks/images/', '/images/') if i.image_url else "",
                "detectedDate": i.detected_date.isoformat() if i.detected_date else None,
                "createdAt": i.created_at.isoformat() if hasattr(i, 'created_at') else None,
            })

        # Calculate issue counts
        issue_count = issues.count()
        critical_count = issues.filter(concern_level__gte=8).count()
        high_count = issues.filter(concern_level__gte=6, concern_level__lt=8).count()
        moderate_count = issues.filter(concern_level__gte=4, concern_level__lt=6).count()
        
        # Calculate estimated repair cost
        total_repair_cost = 0
        for inspection in issues:
            if inspection.estimated_cost_low and inspection.estimated_cost_high:
                avg_cost = (float(inspection.estimated_cost_low) + float(inspection.estimated_cost_high)) / 2
                total_repair_cost += avg_cost

        data = {
            "id": str(p.id),
            "address": p.address,
            "city": p.city or "",
            "state": p.state or "",
            "zipCode": p.zip_code or "",
            "tourDate": p.tour_date.isoformat() if p.tour_date else None,
            "issueCount": issue_count,
            "criticalIssues": critical_count,
            "highIssues": high_count,
            "moderateIssues": moderate_count,
            "imageUrl": p.image_url.replace('/Users/saketh/Desktop/Calhacks/images/', '/images/') if p.image_url else "",
            "grade": p.grade or "B+",
            "estimatedPrice": float(p.estimated_price) if p.estimated_price else 0,
            "listPrice": float(p.estimated_price) if p.estimated_price else 0,
            "ourEstimate": float(p.estimated_price) * 0.95 if p.estimated_price else 0,
            "estimatedRepairCost": total_repair_cost,
            "createdAt": p.created_at.isoformat(),
            "updatedAt": p.updated_at.isoformat(),
            "issues": issue_list,
        }

        return JsonResponse({"success": True, "data": data})
    except Property.DoesNotExist:
        return JsonResponse({"success": False, "error": "Property not found"}, status=404)
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def analyze_property_image(request):
    """
    Accepts YOLO detection results and image path,
    sends image + bounding box data to Claude for analysis,
    stores issues, and returns structured inspection data + suggested price.
    """

    try:
        # --- Parse incoming YOLO data ---
        body = json.loads(request.body)
        property_id = body.get("property_id")
        timestamp = body.get("timestamp")
        detections = body.get("detections", [])
        image_path = body.get("image_path")

        if not property_id or not detections or not image_path:
            return JsonResponse({
                "success": False,
                "error": "Missing property_id, detections, or image_path"
            }, status=400)

        # --- Encode image for Claude ---
        try:
            with open(image_path, "rb") as f:
                encoded_image = base64.b64encode(f.read()).decode("utf-8")
        except FileNotFoundError:
            return JsonResponse({
                "success": False,
                "error": f"Image not found at {image_path}"
            }, status=400)

        mime_type, _ = mimetypes.guess_type(image_path)
        if not mime_type:
            mime_type = "image/png"

        # --- Detection summary ---
        detection_summary = "\n".join([
            f"- Object: {d['name']} "
            f"(Confidence: {d['confidence']:.2f}, "
            f"Box: [{d['xmin']},{d['ymin']} → {d['xmax']},{d['ymax']}])"
            for d in detections
        ])

        # --- Enhanced Expert Prompt ---
        prompt = f"""
        You are a professional home inspector with 20+ years of experience. Analyze this property inspection image carefully.

        DETECTION DATA:
        {detection_summary}

        CRITICAL INSTRUCTIONS:
        1. Look at the ACTUAL image content, not just the detection labels
        2. Identify what you actually see - be SPECIFIC about the type of surface (concrete floor, drywall ceiling, wood beam, tile wall, etc.)
        3. DO NOT use generic terms - instead of "window frame" say "concrete wall", "floor surface", "ceiling", etc.
        4. Provide detailed, actionable descriptions
        5. Include professional recommendations

        ANALYSIS REQUIREMENTS FOR EACH ISSUE:

        **Title Format**: [Material Type] + [Issue Type] + [Location if notable]
        Examples: "Concrete Floor Crack - Near Entrance", "Drywall Water Damage - Ceiling", "Wood Beam Structural Crack"

        **Description Format** (3-4 sentences):
        1. Physical description: "A [direction] crack measuring approximately [size] is visible on the [material/surface]. The crack shows [characteristics]."
        2. Assessment: "This type of damage typically indicates [cause/concern]. [Additional technical observation]."
        3. Recommendation: "We recommend [specific action - e.g., 'consulting a structural engineer', 'monitoring for changes', 'immediate repair', 'scheduling professional inspection']."
        4. Timeline: "[Urgency - e.g., 'Address within 30 days', 'Monitor over next 6 months', 'Requires immediate attention']."

        **Professional Recommendations** (include ONE):
        - "Contact a licensed structural engineer for detailed assessment"
        - "Schedule a professional plumber to investigate water source"
        - "Consult with a foundation specialist before proceeding"
        - "Monitor for expansion over the next 6-12 months"
        - "Immediate repair recommended to prevent further deterioration"
        - "Obtain multiple contractor quotes for accurate pricing"

        **Category Options**: Structural, Exterior, Interior, Plumbing, Electrical, HVAC, Safety, Cosmetic
        **Priority**: Low/Moderate/High/Critical
        **Concern Level**: 1-10 (1=minor cosmetic, 10=immediate safety hazard)

        IMPORTANT: Make each description UNIQUE. Vary your language and provide different details for similar issues.

        Respond ONLY with valid JSON:
        {{
          "issues": [
            {{
              "title": "Specific Material + Issue + Location",
              "description": "4-sentence detailed description with physical details, assessment, recommendation, and timeline",
              "priority": "Priority level",
              "category": "Category",
              "concernLevel": 1-10,
              "estimatedCostLow": realistic_low_estimate,
              "estimatedCostHigh": realistic_high_estimate
            }}
          ],
          "suggestedPrice": property_value_adjustment
        }}
        """

        # --- Anthropic API setup ---
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            return JsonResponse({"success": False, "error": "Missing Anthropic API key"}, status=500)

        headers = {
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01"
        }

        payload = {
            "model": "claude-3-haiku-20240307",  
            "max_tokens": 3500,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": mime_type,
                                "data": encoded_image
                            }
                        }
                    ]
                }
            ]
        }

        # --- Call Anthropic ---
        resp = requests.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload)
        print(f"DEBUG: Claude status {resp.status_code}")
        print(f"DEBUG: Claude output preview: {resp.text[:300]}")

        if resp.status_code != 200:
            return JsonResponse({
                "success": False,
                "error": f"Anthropic returned {resp.status_code}: {resp.text}"
            }, status=500)

        raw = resp.json()
        text_content = raw["content"][0]["text"].strip()

        # --- Clean and parse ---
        if text_content.startswith("```"):
            text_content = text_content.strip("`").replace("json", "").strip()

        try:
            parsed = json.loads(text_content)
        except json.JSONDecodeError:
            print("⚠️ JSON parse failed, fallback to unstructured mode.")
            parsed = {"issues": [], "suggestedPrice": None}

        issues = parsed.get("issues", [])
        suggested_price = parsed.get("suggestedPrice")

        # --- Convert image path to web URL ---
        if image_path.startswith("/Users/saketh/Desktop/Calhacks/images/"):
            web_image_url = image_path.replace(
                "/Users/saketh/Desktop/Calhacks/images/",
                "/images/"
            )
        elif image_path.startswith("/Users/saketh/Desktop/Calhacks/ml_training/processed_images/"):
            web_image_url = image_path.replace(
                "/Users/saketh/Desktop/Calhacks/ml_training/processed_images/",
                "/ml_training/processed_images/"
            )
        elif image_path.startswith("/ml_training/"):
            # Already a web-accessible URL
            web_image_url = image_path
        else:
            # Fallback - use as is
            web_image_url = image_path

        # --- Save to DB ---
        saved_issues = []
        for issue in issues:
            new_issue = Inspection(
                property_id=property_id,
                title=issue.get("title", "Unknown Issue"),
                description=issue.get("description", ""),
                priority=issue.get("priority", "Moderate"),
                category=issue.get("category", "General"),
                concern_level=issue.get("concernLevel", 5),
                estimated_cost_low=issue.get("estimatedCostLow", issue.get("estimated_cost_low", 0)),
                estimated_cost_high=issue.get("estimatedCostHigh", issue.get("estimated_cost_high", 0)),
                image_url=web_image_url,
                detected_date=now().date(),
                created_at=now()
            )
            new_issue.save()
            saved_issues.append({
                "id": str(new_issue.id),
                "title": new_issue.title,
                "priority": new_issue.priority,
                "concern_level": new_issue.concern_level,
                "costRange": f"${new_issue.estimated_cost_low} - ${new_issue.estimated_cost_high}"
            })

        return JsonResponse({
            "success": True,
            "timestamp": timestamp,
            "detectionsReceived": len(detections),
            "issuesSaved": len(saved_issues),
            "suggestedPrice": suggested_price,
            "data": saved_issues,
            "claude_raw": text_content
        })

    except Exception as e:
        print("❌ ERROR in analyze_property_image:", e)
        return JsonResponse({"success": False, "error": str(e)}, status=500)


