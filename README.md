# ReLoop

ReLoop is a responsive e-waste recovery homepage prototype. It uses a warm editorial visual system inspired by the supplied reference image and includes a working upload/drop interaction, demo category selection, classification results, quantity-based reward calculation, and prototype notices for future actions.

The prototype also includes an Info view and a Recovery view. Recovery contains dummy Delhi NCR recycling-centre listings and a local-only pickup request form. It does not create real bookings or contact real recycling providers. The demo phone format is `+91 0000000000`.

## Run the frontend

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`.

## Run the backend

```powershell
cd server
npm install
Copy-Item .env.example .env
npm run dev
```

The API runs on `http://localhost:4000`. The prototype includes a lightweight local classifier, so the upload flow still works when the backend is not running. It recognizes filenames containing common terms for smartphones, laptops, and earphones/headphones, then returns an illustrative e-waste grade:

- A: working and suitable for reuse
- B: working with light wear
- C: usable for parts or recovery
- D: end-of-life condition

This is not a trained image-recognition model: image contents alone cannot be reliably classified without a model. For the supplied examples, filenames such as `mobile-image.png`, `laptop-image.png`, and `earphone-image.png` are recognized. MongoDB is optional; when it is unavailable the API returns a clear `saved: false` persistence status instead of claiming a record was stored.
