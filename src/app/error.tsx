"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="title">Algo saiu do previsto.</h1>
      <p className="mt-3 max-w-md text-ink-mute">Não foi possível carregar esta página agora. Tente novamente em instantes.</p>
      <button type="button" onClick={reset} className="btn btn-dark mt-7">Tentar novamente</button>
    </main>
  );
}
