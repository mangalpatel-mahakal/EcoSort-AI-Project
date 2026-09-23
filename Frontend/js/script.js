// ===============================
// LOGIN CHECK
// ===============================

const loggedInUser =
    localStorage.getItem("userEmail");

if (!loggedInUser) {
    window.location.href = "login.html";
}


// ===============================
// ELEMENTS
// ===============================

const wasteImage =
    document.getElementById("wasteImage");

const imagePreview =
    document.getElementById("imagePreview");

const classifyBtn =
    document.getElementById("classifyBtn");

const wasteType =
    document.getElementById("wasteType");


console.log("EcoSort JavaScript loaded");


// ===============================
// IMAGE PREVIEW
// ===============================

wasteImage.addEventListener(
    "change",
    function () {

        const file =
            wasteImage.files[0];

        if (!file) {
            return;
        }

        const image =
            document.createElement("img");

        image.src =
            URL.createObjectURL(file);

        image.style.width =
            "250px";

        image.style.marginTop =
            "20px";

        image.style.borderRadius =
            "10px";

        imagePreview.innerHTML =
            "";

        imagePreview.appendChild(
            image
        );

    }
);


// ===============================
// CLASSIFY UPLOADED IMAGE
// ===============================

classifyBtn.addEventListener(
    "click",
    async function () {

        console.log(
            "Classify button clicked"
        );

        const file =
            wasteImage.files[0];


        if (!file) {

            wasteType.textContent =
                "Please select an image first.";

            return;
        }


        wasteType.textContent =
            "Classifying...";


        const formData =
            new FormData();


        formData.append(
            "wasteImage",
            file
        );


        const userEmail =
            localStorage.getItem(
                "userEmail"
            );


        formData.append(
            "userEmail",
            userEmail
        );


        try {

            const response =
                await fetch(
                    "/api/classify",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const data =
                await response.json();


            console.log(
                "Backend response:",
                data
            );


            if (data.success) {
                
                 if (data.demoMode) {

    wasteType.innerHTML =
        "<strong>Category:</strong> " + data.category +
        "<br><strong>Recyclable:</strong> Yes" +
        "<br><strong>Disposal:</strong> Put it in the dry waste bin." +
        "<br><strong>Mode:</strong> Demo Mode";

} else {

    wasteType.innerHTML =
        "<strong>Category:</strong> " + data.category +
        "<br><strong>Mode:</strong> AI Classification";

}
                loadHistory();

            } else {

                wasteType.textContent =
                    data.message ||
                    "Unable to classify image.";

            }


        } catch (error) {

            console.error(
                "Request error:",
                error
            );


            wasteType.textContent =
                "Server connection failed.";

        }

    }
);


// ==================================================
// LIVE CAMERA WASTE SCANNER
// ==================================================

const cameraPreview =
    document.getElementById(
        "cameraPreview"
    );

const cameraCanvas =
    document.getElementById(
        "cameraCanvas"
    );

const openCameraBtn =
    document.getElementById(
        "openCameraBtn"
    );

const captureBtn =
    document.getElementById(
        "captureBtn"
    );

const closeCameraBtn =
    document.getElementById(
        "closeCameraBtn"
    );

const capturedImagePreview =
    document.getElementById(
        "capturedImagePreview"
    );

const cameraWasteType =
    document.getElementById(
        "cameraWasteType"
    );


let cameraStream = null;


// ===============================
// OPEN CAMERA
// ===============================

openCameraBtn.addEventListener(
    "click",
    async function () {

        try {

            cameraWasteType.textContent =
                "Opening camera...";


            // Ask browser for camera access
            cameraStream =
                await navigator.mediaDevices
                    .getUserMedia({

                        video: {
                            facingMode:
                                "environment"
                        },

                        audio: false

                    });


            // Show camera stream
            cameraPreview.srcObject =
                cameraStream;


            await cameraPreview.play();


            captureBtn.disabled =
                false;

            closeCameraBtn.disabled =
                false;

            openCameraBtn.disabled =
                true;


            cameraWasteType.textContent =
                "Camera ready. Place waste in front of camera.";

        } catch (error) {

            console.error(
                "Camera error:",
                error
            );


            cameraWasteType.textContent =
                "Unable to open camera. Please allow camera permission.";

        }

    }
);


// ===============================
// CAPTURE AND IDENTIFY
// ===============================

captureBtn.addEventListener(
    "click",
    function () {

        if (!cameraStream) {

            cameraWasteType.textContent =
                "Please open camera first.";

            return;
        }


        const width =
            cameraPreview.videoWidth;

        const height =
            cameraPreview.videoHeight;


        if (!width || !height) {

            cameraWasteType.textContent =
                "Camera is not ready yet.";

            return;
        }


        // Set canvas size equal to camera
        cameraCanvas.width =
            width;

        cameraCanvas.height =
            height;


        const context =
            cameraCanvas.getContext(
                "2d"
            );


        // Draw current camera frame
        context.drawImage(
            cameraPreview,
            0,
            0,
            width,
            height
        );


        cameraWasteType.textContent =
            "Photo captured. Classifying...";


        // Convert captured frame into image
        cameraCanvas.toBlob(
            async function (blob) {

                if (!blob) {

                    cameraWasteType.textContent =
                        "Unable to capture image.";

                    return;
                }


                // ===============================
                // SHOW CAPTURED IMAGE
                // ===============================

                const capturedImage =
                    document.createElement(
                        "img"
                    );


                capturedImage.src =
                    URL.createObjectURL(
                        blob
                    );


                capturedImage.alt =
                    "Captured waste";


                capturedImagePreview.innerHTML =
                    "";


                capturedImagePreview.appendChild(
                    capturedImage
                );


                // ===============================
                // SEND IMAGE TO BACKEND
                // ===============================

                const formData =
                    new FormData();


                formData.append(
                    "wasteImage",
                    blob,
                    "camera-waste.jpg"
                );


                const userEmail =
                    localStorage.getItem(
                        "userEmail"
                    );


                formData.append(
                    "userEmail",
                    userEmail
                );


                try {

                    const response =
                        await fetch(
                            "/api/classify",
                            {
                                method:
                                    "POST",

                                body:
                                    formData
                            }
                        );


                    const data =
                        await response.json();


                    console.log(
                        "Camera AI response:",
                        data
                    );


                    if (data.success) {

                        cameraWasteType.textContent =
                            "♻️ Category: " +
                            data.category;


                        // Refresh history
                        loadHistory();

                    } else {

                        cameraWasteType.textContent =
                            data.message ||
                            "Unable to identify waste.";

                    }


                } catch (error) {

                    console.error(
                        "Camera classification error:",
                        error
                    );


                    cameraWasteType.textContent =
                        "Server connection failed.";

                }

            },

            "image/jpeg",

            0.9
        );

    }
);


// ===============================
// CLOSE CAMERA
// ===============================

closeCameraBtn.addEventListener(
    "click",
    function () {

        if (cameraStream) {

            cameraStream
                .getTracks()
                .forEach(
                    function (track) {

                        track.stop();

                    }
                );


            cameraStream =
                null;

        }


        cameraPreview.srcObject =
            null;


        captureBtn.disabled =
            true;

        closeCameraBtn.disabled =
            true;

        openCameraBtn.disabled =
            false;


        cameraWasteType.textContent =
            "Camera closed.";

    }
);


// ===============================
// LOGOUT
// ===============================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            // Close camera before logout
            if (cameraStream) {

                cameraStream
                    .getTracks()
                    .forEach(
                        function (track) {

                            track.stop();

                        }
                    );

            }


            localStorage.removeItem(
                "userName"
            );

            localStorage.removeItem(
                "userEmail"
            );


            window.location.href =
                "login.html";

        }
    );

}


// ===============================
// WELCOME USER
// ===============================

const welcomeUser =
    document.getElementById(
        "welcomeUser"
    );


const userName =
    localStorage.getItem(
        "userName"
    );


if (welcomeUser && userName) {

    welcomeUser.textContent =
        "Welcome, " + userName;

}


// ===============================
// LOAD CLASSIFICATION HISTORY
// ===============================

async function loadHistory() {

    const userEmail =
        localStorage.getItem(
            "userEmail"
        );


    const historyList =
        document.getElementById(
            "historyList"
        );


    if (!userEmail || !historyList) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/history/${userEmail}`
            );


        const data =
            await response.json();


        if (!data.success) {

            historyList.textContent =
                "Unable to load history.";

            return;
        }


        if (data.history.length === 0) {

            historyList.textContent =
                "No classification history yet.";

            return;
        }


        historyList.innerHTML =
            "";


        data.history.forEach(
            function (item) {

                const historyItem =
                    document.createElement(
                        "div"
                    );


                historyItem.className =
                    "history-item";


                const category =
                    document.createElement(
                        "span"
                    );


                category.className =
                    "history-category";


                category.textContent =
                    item.category;


                const date =
                    document.createElement(
                        "span"
                    );


                date.className =
                    "history-date";


                date.textContent =
                    new Date(
                        item.createdAt
                    ).toLocaleString();


                historyItem.appendChild(
                    category
                );


                historyItem.appendChild(
                    date
                );


                historyList.appendChild(
                    historyItem
                );

            }
        );


    } catch (error) {

        console.error(
            "History load error:",
            error
        );


        historyList.textContent =
            "Unable to load history.";

    }

}


// ===============================
// PAGE LOAD
// ===============================

loadHistory();