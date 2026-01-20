# Real(i)tor: a smarter way to inspect and valuate properties.


## Inspiration
I noticed that first-time homebuyers often struggle to really understand what they’re looking at when touring homes. Things like cracks in the floor, stains on the ceiling, or uneven surfaces can be easy to miss, but they add up. While inspection services exist, they’re still mostly manual and can be expensive or time consuming. On top of that, the buying process itself can feel overwhelming since most people don’t even know what to ask or where to start.
That’s what inspired us to build something that actually helps buyers and brings fresh innovation to an industry that hasn’t changed much in decades. Companies like Inspectify, a YC backed startup, have made strides by connecting inspectors and clients online, but I want to take it further by creating an automated, intelligent solution that helps buyers spot problems instantly and feel more confident about one of the biggest decisions of their lives.

## What it does
Imagine a homebuyer walking through a property. Instead of wandering around unsure of what to look for or waiting days for a manual inspection, they can simply turn on Real(i)tor. As they move through the home, Real(i)tor’s technology automatically detects potential issues like cracks in the walls, ceiling stains, or uneven floors, and logs them in real time. At the end of the tour, the buyer instantly receives a detailed “Property Report” that highlights everything the system found. Through Real(i)tor’s full-stack app, users can review each issue with photos, descriptions, and estimated severity, helping them make smarter, more confident decisions before ever calling an inspector.
## How I built it
My use-case for Real(i)tor’s tech are the Meta Ray-Ban glasses. By streaming through these glasses via Instagram live, I was able to gather live data through a continuous loop of screenshots in a ~20 fps frame rate. This data is then transmitted to a YOLOv8 object detection model that is able to highlight and annotate issues in a JSON. To contextualize and condense the YOLOv8 output, I processed this JSON through Claude 4.5 Sonnet to create the “property report”, which is then stored in a postregsql database. My full-stack application, built with primarily react.js, typescript, and django, then accesses our PostgreSQL DB for further analysis and visualization.

## Challenges I ran into
The most difficult challenge for me was finding a creative way to access footage from the Meta Ray-Ban glasses, as there is no official SDK (yet) for this Iarable. The Instagram live method, while innovative, did restrict us from using the true video quality of the glasses due to the packet loss. Another challenge from here was being able to deal with the low-res footage; by scaling up my parameters for the YOLOv8 model and running for more epochs, I saw that low-res footage object detection was feasible. Finally, being able to migrate our “property report” to the database was tricky as I was working with completely different platforms. 

I also ran into the issue of not being able to do live feedback to the user. I initially spent a significant amount of time trying to make truly autonomous way such that as a user toured a property, they would be getting live feedback from our application. I realized hoIver that once livestreaming, the Meta glasses would not allow notifications to be displayed 

## Accomplishments that I’re proud of
I'm are proud that I created a real-time object detection loop accessed by Iarable tech; to us, it really felt like I Ire building something for the future. I are also proud of being able to deal with so many different platforms and programming languages (I are counting 5 and 4 total, respectively!).


## What’s next for Real(i)tor
I aim to build on the autonomous experience of Real(i)tor by introducing live voice interaction during property tours. Through an interactive HUD display integrated into smart glasses, users will receive real-time guidance on what to look for as they explore. They’ll also be able to ask questions directly to homeowners or agents and get instant, contextual responses, creating a seamless and immersive touring experience.
