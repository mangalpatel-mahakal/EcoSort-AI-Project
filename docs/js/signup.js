const signupBtn =
    document.getElementById("signupBtn");

const message =
    document.getElementById("message");


signupBtn.addEventListener(
    "click",
    async function () {

        const name =
            document.getElementById("name").value;

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;


        const response =
            await fetch(
                "/api/auth/signup",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );


        const data =
            await response.json();


        message.textContent =
            data.message;

    }
);