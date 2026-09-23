const loginBtn =
    document.getElementById("loginBtn");

const message =
    document.getElementById("message");


loginBtn.addEventListener(
    "click",
    async function () {

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;


        const response =
            await fetch(
                "/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


        const data =
            await response.json();


        message.textContent =
            data.message;


        if (response.ok) {

            localStorage.setItem(
                "userName",
                data.name
            );

            localStorage.setItem(
                "userEmail",
                data.email
            );


            window.location.href =
                "index.html";

        }

    }
);