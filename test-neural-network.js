// Simple test for Neural Network implementation
// This tests the basic functionality without running the full app

const testNeuralNetwork = async () => {
  console.log("Testing Neural Network Implementation...\n");

  // Create simple XOR-like dataset
  const trainData = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ];

  const trainLabels = [[0], [1], [1], [0]];

  console.log("Training Data:");
  console.log(trainData);
  console.log("\nTraining Labels:");
  console.log(trainLabels);

  const inputs = {
    trainData: trainData,
    trainLabels: trainLabels,
  };

  const params = {
    hiddenLayers: "4",
    activation: "relu",
    learningRate: 0.1,
    epochs: 100,
    batchSize: 4,
  };

  console.log("\nParameters:");
  console.log(params);
  console.log("\n" + "=".repeat(50));
  console.log("Starting training...\n");

  try {
    // Import the algorithm
    const { neuralNetworkAlgorithm } =
      await import("./src/config/algorithms/numericalOptimization/neuralNetwork.ts");

    // Run the computation
    const result = await neuralNetworkAlgorithm.compute(inputs, params);

    console.log("Training completed successfully!\n");
    console.log("Results:");
    console.log("- Final Loss:", result.finalLoss?.toFixed(6));
    console.log("- Final Accuracy:", result.accuracy?.toFixed(4));
    console.log("- Epochs Trained:", result.epochs);
    console.log("- Network Architecture:", result.model.architecture);
    console.log("\nLoss History (first 10 epochs):");
    console.log(result.lossHistory.slice(0, 10).map((l) => l.toFixed(6)));
    console.log("\nLoss History (last 10 epochs):");
    console.log(result.lossHistory.slice(-10).map((l) => l.toFixed(6)));

    console.log("\nPredictions:");
    result.predictions.forEach((pred, i) => {
      console.log(
        `Input: [${trainData[i]}] -> Predicted: ${pred[0].toFixed(4)}, Actual: ${trainLabels[i][0]}`,
      );
    });

    console.log("\n" + "=".repeat(50));
    console.log("Test PASSED!");
  } catch (error) {
    console.error("\nTest FAILED!");
    console.error("Error:", error.message);
    console.error("\nStack trace:");
    console.error(error.stack);
    process.exit(1);
  }
};

testNeuralNetwork();
