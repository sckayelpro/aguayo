<button
  onClick={() =>
    signIn('google', {
      callbackUrl: '/', // ← después de loguearse, vuelve al home
    })
  }
  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
>
  Continuar con Google
</button>