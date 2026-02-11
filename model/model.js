// Define download conditions
const conditions = {
    requireWifi: true
};

// Download the model from Firebase ML
firebase.ml().model("Item_classifier").download(conditions)
    .then((model) => {
        const modelFile = model.file; // Path or Object URL to the model

        if (modelFile) {
            // Initialize the TensorFlow Lite Interpreter with the downloaded model
            // Note: Ensure you have the appropriate TFLite library imported
            const interpreter = new Interpreter(modelFile);

            // Connect the interpreter to the camera logic to detect the item
            startCameraDetection(interpreter, (result) => {
                if (result === "clothe") {
                    // Make a static description inside postform
                    const staticDescription = "Detected Item: Clothe";
                    updatePostFormDescription(staticDescription);

                    // Navigate to Clothe screen
                    navigateToClotheScreen();
                } else {
                    // Result is null or not clothe -> Retake picture
                    promptRetake();
                }
            });
        }
    })
    .catch((error) => {
        console.error("Model download failed:", error);
    });