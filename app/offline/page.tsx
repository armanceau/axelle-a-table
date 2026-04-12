export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-3 text-3xl font-semibold">Vous êtes hors connexion</h1>
      <p className="text-muted-foreground">
        Vérifiez votre connexion puis réouvrez l'application. Les données deja chargées
        restent accessibles tant qu'elles sont en cache.
      </p>
    </main>
  )
}
