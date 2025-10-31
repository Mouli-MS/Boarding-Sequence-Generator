# Boarding-Sequence-Generator
An interactive Angular web application that determines the optimal boarding sequence for bus passengers based on their seat positions.
It ensures that passengers with seats farther from the entry board first, reducing overall boarding time.

# 🚀 Features

Upload booking data directly via CSV/text file

Automatically generates boarding order

Displays sequence, booking ID, and valid seats

Validates input based on real-world boarding constraints

Reports all invalid seat labels and duplicate seat assignments

Professional UI with dark/light mode toggle (optional)

Built using Angular (standalone components) and TypeScript


# Boarding Constraints

Single Entry — Passengers board from the front only.

Seat Distance Rule — Farther seats (higher numbers) board first.

Valid Seats — Only seats labeled A1–A20, B1–B20, C1–C20, D1–D20 are valid.

No Shared Seats — A seat cannot appear in multiple bookings.

Invalid Labels — Any seat not matching the pattern (e.g., C, Cx, Bq, etc.) is rejected.

Seat Numbers Range — Only 1 to 20 are allowed.

Each line contains a Booking_ID followed by one or more seat labels separated by commas.

# 🧠 Logic Behind Sorting

Parse file lines → skip headers.

For each booking:

Validate each seat (row + number).

Track duplicates using a seat map.

Compute max seat number for each booking (farthest distance).

Sort bookings:

Descending by maxSeat

Then ascending by Booking_ID (tie-breaker)

Return valid bookings first, then list of validation errors.


# Screenshots

<img width="1285" height="595" alt="image" src="https://github.com/user-attachments/assets/d819fe50-9d50-4186-a422-c07ab723756d" />

<img width="1294" height="843" alt="image" src="https://github.com/user-attachments/assets/6ac3f9e8-72ac-4917-8283-89d3dadd3e81" />

# 🧰 Project Setup
1️⃣ Clone or create the project

git clone https://github.com/<your-username>/bus-boarding-app.git

cd bus-boarding-app

2️⃣ Install dependencies

npm install

3️⃣ Start the development server
ng serve

4️⃣ Open in your browser

Go to http://localhost:4200
