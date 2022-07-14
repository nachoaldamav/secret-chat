import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import ErrorToast from "../components/ErrorToast";
import { nhost } from "../libs/nhost";
import createUser from "../utils/createUser";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<ErrorNhost | null>(null);

  async function handleLogin() {
    setLoading(true);

    if (data.password !== data.confirmPassword) {
      setError({
        error: "password_mismatch",
        message: "Las contraseñas no coinciden",
        status: 400,
      });
      setLoading(false);
      return;
    } else {
      nhost.auth
        .signUp({
          email: data.email,
          password: data.password,
          options: {
            displayName: data.username,
          },
        })
        .then(async (res) => {
          nhost.auth
            .signIn({
              email: data.email,
              password: data.password,
            })
            .then(async (res) => {
              await createUser(res.session?.accessToken as string);
              router.push("/home");
            });
        })
        .catch(async (error: ErrorNhost) => {
          console.error(error);
          setLoading(false);
          setError(error);
        });
    }
  }

  return (
    <div className="flex flex-col w-full h-full items-center justify-start">
      <h1 className="text-2xl text-center font-bold">Registrarse</h1>
      <form
        className="w-3/5 h-full flex flex-col items-start justify-center"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <label htmlFor="username" className="font-medium text-gray-300">
          Nombre de usuario
        </label>
        <input
          className="main-input"
          id="username"
          type="text"
          maxLength={20}
          required
          value={data.username}
          onChange={(e) => setData({ ...data, username: e.target.value })}
        />

        <label htmlFor="email" className="font-medium text-gray-300">
          Correo Electrónico
        </label>
        <input
          className="main-input"
          id="email"
          type="email"
          required
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />

        <label htmlFor="password" className="font-medium text-gray-300">
          Contraseña
        </label>
        <input
          className="main-input"
          required
          id="password"
          type="password"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />

        <label htmlFor="confirmPassword" className="font-medium text-gray-300">
          Confirmar Contraseña
        </label>
        <input
          className="main-input"
          required
          id="confirmPassword"
          type="password"
          value={data.confirmPassword}
          onChange={(e) =>
            setData({ ...data, confirmPassword: e.target.value })
          }
        />

        <button
          disabled={loading}
          type="submit"
          className="text-white self-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
        >
          {loading ? (
            <>
              <svg
                role="status"
                className="inline w-4 h-4 mr-3 text-white animate-spin"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentColor"
                />
              </svg>
              Cargando...
            </>
          ) : (
            "Crear cuenta"
          )}
        </button>
        <div className="inline-flex self-center items-center justify-center mt-4">
          <Link href="/login" as="login">
            <a className="text-blue-500 text-sm font-medium hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500 dark:focus:ring-blue-400">
              Ya tengo una cuenta
            </a>
          </Link>
        </div>
      </form>
      {error && (
        <span className="absolute bottom-0 left-0 mr-4 mb-4">
          <ErrorToast error={ERROR_CODES[error.error] || error.message} />
        </span>
      )}
    </div>
  );
}

const ERROR_CODES: any = {
  "invalid-email": "El correo electrónico no es válido",
};

type ErrorNhost = {
  error: string;
  message: string;
  status: number;
};
