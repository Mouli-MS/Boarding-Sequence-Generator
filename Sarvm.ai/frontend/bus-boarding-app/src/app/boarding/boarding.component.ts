import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ValidBooking {
  seq: number;
  id: number;
  seats: string[];
}

@Component({
  selector: 'app-boarding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boarding.component.html',
  styleUrls: ['./boarding.component.css']
})
export class BoardingComponent {
  fileName = '';
  fileContent = '';
  validBookings: ValidBooking[] = [];
  errors: string[] = [];

  // file input handler (sets fileContent)
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.fileName = '';
      this.fileContent = '';
      return;
    }
    const file = input.files[0];
    this.fileName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      // store full file text; generation happens on button click
      this.fileContent = String(reader.result || '');
      // optional: clear previous outputs when new file loaded
      this.validBookings = [];
      this.errors = [];
    };
    reader.onerror = () => {
      this.errors = ['Failed to read the file.'];
      this.fileContent = '';
    };
    reader.readAsText(file, 'utf-8');
  }

  // main logic called by the button in your template
  generateSequence(): void {
    this.validBookings = [];
    this.errors = [];

    if (!this.fileContent || !this.fileContent.trim()) {
      this.errors.push('Please upload a valid booking data file.');
      return;
    }

    // 1) normalize newlines and split into lines (keep order)
    const normalized = this.fileContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const rawLines = normalized.split('\n').map(l => l.trim());
    // drop empty lines but keep original line indices for error messages
    const lines = rawLines.map((l, idx) => ({ text: l, rawIndex: idx + 1 })).filter(x => x.text.length > 0);

    if (lines.length < 2) {
      this.errors.push('File must contain a header and at least one booking line.');
      return;
    }

    // 2) Determine header presence (if first non-empty line contains 'booking')
    let startIndex = 0;
    if (lines[0].text.toLowerCase().includes('booking')) startIndex = 1;

    // 3) Prepare validation helpers
    const seatRegex = /^[A-D](?:[1-9]|1\d|20)$/i; // A1-A9, A10-A19, A20 (rows A-D)
    const seatOwner = new Map<string, number>();   // normalized seat -> bookingId
    const bookingsTemp: { id: number; seats: string[]; maxSeat: number; lineNo: number }[] = [];

    // 4) Process each data line
    for (let idx = startIndex; idx < lines.length; idx++) {
      const { text: line, rawIndex: lineNo } = lines[idx];

      // split into exactly two parts: id and seats string (protects tokens like A10)
      const parts = line.split(',', 2);
      if (parts.length < 2) {
        this.errors.push(`Invalid format on line ${lineNo}: expected "Booking_ID,Seats".`);
        continue;
      }

      const idStr = parts[0].trim();
      const seatsStr = parts[1].trim();

      if (!idStr) {
        this.errors.push(`Missing Booking_ID on line ${lineNo}.`);
        continue;
      }

      const bookingId = Number(idStr);
      if (!Number.isFinite(bookingId) || !Number.isInteger(bookingId)) {
        this.errors.push(`Invalid Booking_ID "${idStr}" on line ${lineNo}.`);
        continue;
      }

      // split seats by commas only, trim and uppercase
      const seatTokens = seatsStr.split(',').map(s => s.trim()).filter(Boolean);
      if (seatTokens.length === 0) {
        this.errors.push(`No seats found for Booking ${bookingId} on line ${lineNo}.`);
        continue;
      }

      const validSeatsForThisBooking: string[] = [];

      for (const rawSeat of seatTokens) {
        const seat = rawSeat.toUpperCase();

        // validate seat format
        if (!seatRegex.test(seat)) {
          this.errors.push(`Invalid seat "${rawSeat}" in Booking ${bookingId} (line ${lineNo}). Allowed: A–D and 1–20.`);
          continue; // keep checking other seats in this booking
        }

        // detect duplicate across different bookings
        const owner = seatOwner.get(seat);
        if (owner !== undefined && owner !== bookingId) {
          this.errors.push(`Duplicate seat "${seat}" found in Booking ${owner} and Booking ${bookingId} (line ${lineNo}).`);
          continue; // don't add this seat to this booking
        }

        // avoid adding same seat multiple times within same booking
        if (!validSeatsForThisBooking.includes(seat)) {
          validSeatsForThisBooking.push(seat);
          seatOwner.set(seat, bookingId);
        }
      } // end seats loop

      // if at least one valid seat remains for this booking, keep it
      if (validSeatsForThisBooking.length > 0) {
        const maxSeatNum = Math.max(...validSeatsForThisBooking.map(s => Number(s.match(/\d+$/)![0])));
        bookingsTemp.push({ id: bookingId, seats: validSeatsForThisBooking, maxSeat: maxSeatNum, lineNo });
      }
      // else: booking had no valid seats → errors reported above; skip
    } // end lines loop

    // 5) Sort valid bookings: farthest seat first, tie -> smaller ID first
    bookingsTemp.sort((a, b) => {
      if (b.maxSeat === a.maxSeat) return a.id - b.id;
      return b.maxSeat - a.maxSeat;
    });

    // 6) Prepare final validBookings with seq
    this.validBookings = bookingsTemp.map((b, i) => ({ seq: i + 1, id: b.id, seats: b.seats }));

    // 7) If nothing valid and no errors pushed, inform user
    if (this.validBookings.length === 0 && this.errors.length === 0) {
      this.errors.push('No valid bookings found in file.');
    }
    // done — UI should show validBookings first and errors below
  }
}
