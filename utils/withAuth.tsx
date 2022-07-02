import styles from "./styles/pages/ProtectedRoute.module.css";
import { useRouter } from "next/router";
import { useAuthenticationStatus } from "@nhost/nextjs";
import Spinner from "../components/Spinner";

export default function withAuth(Component: any) {
  return function AuthProtected(props: any) {
    const router = useRouter();
    const { isLoading, isAuthenticated } = useAuthenticationStatus();

    if (isLoading) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-2xl">
          <Spinner />
        </div>
      );
    }

    if (!isAuthenticated) {
      router.push("/login");
      return null;
    }

    return <Component {...props} />;
  };
}
