import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QR_REGION_ID = 'qr-reader';

export default function QrScanner({ active, onScanned, onError, scanning, onToggle }) {
  const scannerRef = useRef(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (!scanning) {
      handledRef.current = false;
    }
  }, [scanning]);

  useEffect(() => {
    if (!active) return;

    const scanner = new Html5Qrcode(QR_REGION_ID);
    scannerRef.current = scanner;

    let cancelled = false;
    let started = false;

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1,
          },
          (decodedText) => {
            if (handledRef.current || scanning) return;
            handledRef.current = true;
            onScanned(decodedText.trim());
          },
          (errorMessage) => {
            onError?.(errorMessage);
          },
        );

        started = true;

        if (cancelled) {
          try {
            await scanner.stop();
          } catch {
            // ignore stop errors if the scanner already stopped or failed to start cleanly
          }
        }
      } catch (error) {
        if (!cancelled) {
          onError?.(error?.message || 'Unable to start scanner.');
        }
      }
    };

    startScanner();

    return () => {
      cancelled = true;

      const currentScanner = scannerRef.current;
      scannerRef.current = null;
      handledRef.current = false;

      if (!currentScanner || !started) return;

      currentScanner
        .stop()
        .then(() => {
          currentScanner.clear().catch(() => {
            // ignore clear errors
          });
        })
        .catch(() => {
          // ignore stop errors (already stopped or failed to start)
        });
    };
  }, [active, onError, onScanned, scanning]);

  return (
    <section className="rounded-2xl bg-white p-4 shadow-md sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-slate-900">Scan Customer QR</h2>
        <button
          onClick={onToggle}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 sm:w-auto"
          type="button"
        >
          {active ? 'Stop Scanner' : 'Start Scanner'}
        </button>
      </div>

      <p className="mb-3 text-sm text-slate-500">
        Scan QR containing an order number (example: <span className="font-semibold">SQORD-1BED3476CA</span>).
      </p>

      {active ? (
        <div
          id={QR_REGION_ID}
          className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border border-slate-200"
        />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          Scanner is currently inactive.
        </div>
      )}
    </section>
  );
}
