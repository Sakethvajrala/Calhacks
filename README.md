# Real(i)tor: a smarter way to inspect and valuate properties.

## Inspiration
One of our team members, Saketh, noticed that first-time homebuyers often struggle to really understand what they’re looking at when touring homes. Things like cracks in the floor, stains on the ceiling, or uneven surfaces can be easy to miss, but they add up. While inspection services exist, they’re still mostly manual and can be expensive or time consuming. On top of that, the buying process itself can feel overwhelming since most people don’t even know what to ask or where to start.
That’s what inspired us to build something that actually empowers buyers and brings fresh innovation to an industry that hasn’t changed much in decades. Companies like Inspectify, a YC backed startup, have made strides by connecting inspectors and clients online, but we want to take it further by creating an automated, intelligent solution that helps buyers spot problems instantly and feel more confident about one of the biggest decisions of their lives.

## What it does
Imagine a homebuyer walking through a property. Instead of wandering around unsure of what to look for or waiting days for a manual inspection, they can simply turn on Real(i)tor. As they move through the home, Real(i)tor’s technology automatically detects potential issues like cracks in the walls, ceiling stains, or uneven floors, and logs them in real time. At the end of the tour, the buyer instantly receives a detailed “Property Report” that highlights everything the system found. Through Real(i)tor’s full-stack app, users can review each issue with photos, descriptions, and estimated severity, helping them make smarter, more confident decisions before ever calling an inspector.
## How we built it
Our use-case for Real(i)tor’s tech are the Meta Ray-Ban glasses. By streaming through these glasses via Instagram live, we are able to gather live data through a continuous loop of screenshots in a ~20 fps frame rate. This data is then transmitted to a YOLOv8 object detection model that is able to highlight and annotate issues in a JSON. To contextualize and condense the YOLOv8 output, we process this JSON through Claude 4.5 Sonnet to create the “property report”, which is then stored in a postregsql database. Our full-stack application, built with primarily react.js, typescript, and django, then accesses our PostgreSQL DB for further analysis and visualization.

## Challenges we ran into
The most difficult challenge for us was finding a creative way to access footage from the Meta Ray-Ban glasses, as there is no official SDK (yet) for this wearable. The Instagram live method, while innovative, did restrict us from using the true video quality of the glasses due to the packet loss. Another challenge from here was being able to deal with the low-res footage; by scaling up our parameters for the YOLOv8 model and running for more epochs, we saw that low-res footage object detection was feasible. Finally, being able to migrate our “property report” to the database was tricky as we were working with completely different platforms. 

We also ran into the issue of not being able to do live feedback to the user. We initially spent a significant amount of time trying to make truly autonomous way such that as a user toured a property, they would be getting live feedback from our application. We realized however that once livestreaming, the Meta glasses would not allow notifications to be displayed 

## Accomplishments that we’re proud of
We are proud that we created a real-time object detection loop accessed by wearable tech; to us, it really felt like we were building something for the future. We are also proud of being able to deal with so many different platforms and programming languages (we are counting 5 and 4 total, respectively!).

## What we learned
* All of us had to adapt to learning different frameworks for our duties: Selenium for Rohan for running a streaming bot, PyTorch for Kovidh for training the YOLOv8 model, and postregsql/django for Saketh for the full-stack application and demo.
* Training data is integral! We really learned the hard way about the limitations of running a naive YOLOv8 on a limited number of training examples.

## What’s next for Real(i)tor
We aim to build on the autonomous experience of Real(i)tor by introducing live voice interaction during property tours. Through an interactive HUD display integrated into smart glasses, users will receive real-time guidance on what to look for as they explore. They’ll also be able to ask questions directly to homeowners or agents and get instant, contextual responses, creating a seamless and immersive touring experience.
