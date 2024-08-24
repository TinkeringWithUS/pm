import { useContext, useState } from "react";

import { BACKEND_URL } from "../../../../shared/networkInterface";
import { AuthContextValues } from "../../contexts/AuthContext";

import "./ProfileView.css";

// "image/jpg"
const supportedFileTypes = [
  "jpg",
  "jpeg",
  "png"
];

function ProfileView() {

  const { username, profilePictureUrl, setProfilePictureUrl } = useContext(AuthContextValues);

  const [uploadErrorMessage, setUploadErrorMessage] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {

    event.preventDefault();

    if (event.target.files) {
      const file = event.target.files[0];
      const fileType = file.type.split("/")[1];

      if (!supportedFileTypes.includes(fileType)) {
        setUploadErrorMessage("File Not Supported");
        return;
      }

      const formData = new FormData();
      formData.set("file", file, username + "." + fileType);

      fetch(BACKEND_URL + "/upload_profile", {
        method: "POST",
        body: formData,
        // Not using "Content-type" for the header,
        // allow fetch to automatically set the boundary for us
        // https://stackoverflow.com/questions/3508338/what-is-the-boundary-in-multipart-form-data
      })
        .then((response) => response.text())
        .then(textResponse => {
          setProfilePictureUrl(URL.createObjectURL(file));
          console.log("text response: " + textResponse)
        })
        .catch(() => console.log("error when uploading img"));

    } else {
      setUploadErrorMessage("No File Selected");
    }
  }

  return (
    <>
      <form onSubmit={event => event.preventDefault()}>
        {/* thumbnail of the uploaded image */}
        {/* TODO: Use Canvas api to draw the image for the thumbnail */}
        {profilePictureUrl && (
          <img src={profilePictureUrl} className="profile-picture-thumbnail"/>
        )}
        <label></label>
        <input type="file" onChange={(event) => handleFileUpload(event)}>

        </input>
        <button type="submit">Upload</button>
      </form>
      {uploadErrorMessage !== "" && (
        <div>
          Error: {uploadErrorMessage}
        </div>
      )}
    </>
  );
}

export { ProfileView };