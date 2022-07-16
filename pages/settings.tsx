import { LogoutIcon } from "@heroicons/react/outline";
import { gql } from "graphql-request";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { nhost } from "../libs/nhost";
import getUserData, { UserData } from "../queries/getUserData";
import withAuth from "../utils/withAuth";

function SettingsPage() {
  const router = useRouter();
  const isAuthenticated = nhost.auth.isAuthenticated();
  const [user, setUser] = useState<UserData | null>(null);
  const [values, setValues] = useState<FormValues>({
    custom_avatar: null,
    displayName: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      getUserData().then((user) => setUser(user));
    }
  }, [isAuthenticated]);

  const handleSubmit = async () => {
    const fileId =
      values.custom_avatar !== null
        ? await nhost.storage
            .upload({ file: values.custom_avatar as File })
            .then((result) => result.fileMetadata?.id)
        : null;
    const fileUrl = fileId
      ? nhost.storage.getPublicUrl({ fileId: fileId })
      : null;

    const res = await nhost.graphql
      .request(UPDATE_QUERY, {
        id: user?.id,
        custom_avatar: fileUrl || null,
        displayName: values.displayName || user?.user.displayName,
      })
      .catch((err) => console.error(err));

    if (res) {
      router.reload();
    }
  };

  return (
    <div className="my-4 text-center relative">
      <span className="absolute top-0 -right-6 z-10">
        <button
          className="w-fit rounded-lg px-2 py-2 bg-red-600 text-white hover:bg-red-800 transition duration-300 ease-in-out"
          onClick={async () => {
            await nhost.auth.signOut();
            localStorage.removeItem("twilio_accessToken");
            router.push("/");
          }}
        >
          <LogoutIcon className="w-6 h-6" />
        </button>
      </span>
      <h1 className="text-xl font-bold">Ajustes</h1>
      <p className="text-sm">Aquí puedes cambiar los ajustes de tu cuenta.</p>
      <form
        className="flex flex-col items-center"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <label className="text-sm font-bold mt-4 mb-2">Nombre de usuario</label>
        <input
          className="w-full p-2 border-2 border-gray-600 bg-transparent rounded-xl"
          type="text"
          value={values.displayName || user?.user.displayName}
          onChange={(e) =>
            setValues({ ...values, displayName: e.target.value })
          }
        />
        <label className="text-sm font-bold mt-4 mb-2">
          Avatar personalizado
        </label>
        <input
          className="w-full p-2 bg-transparent"
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) {
              setValues({ ...values, custom_avatar: e.target.files[0] });
            }
          }}
        />
        <button
          className=" w-fit rounded-lg bg-blue-600 text-white py-2 px-6 font-medium text-xl mt-4"
          type="submit"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}

const UPDATE_QUERY = gql`
  mutation updateUser(
    $custom_avatar: String = custom_avatar
    $id: uuid = id
    $displayName: String = displayName
  ) {
    update_user_data(
      where: { id: { _eq: $id } }
      _set: { custom_avatar: $custom_avatar }
    ) {
      affected_rows
    }
    updateUser(pk_columns: { id: $id }, _set: { displayName: $displayName }) {
      id
    }
  }
`;

type FormValues = {
  custom_avatar: File | null;
  displayName: string;
};

export default withAuth(SettingsPage);
