import React, { useState, useEffect, useRef } from 'react';

// Main App component for the PDF to Word Converter
const App = () => {
    // State to hold the selected PDF file
    const [selectedFile, setSelectedFile] = useState(null);
    // State to manage loading status during conversion
    const [isLoading, setIsLoading] = useState(false);
    // State to store any messages for the user (success, error, etc.)
    const [message, setMessage] = useState('');
    // State to store the type of message (e.g., 'info', 'success', 'error') for styling
    const [messageType, setMessageType] = useState('info');
    // State to store the URL of the converted Word file for download
    const [downloadUrl, setDownloadUrl] = useState('');
    // State for the progress percentage (0-100)
    const [progress, setProgress] = useState(0);
    // State for the estimated conversion time in seconds
    const [estimatedSeconds, setEstimatedSeconds] = useState(0);
    // Ref to store the interval ID for progress updates
    const progressIntervalRef = useRef(null);
    // Ref to store the interval ID for estimated time updates
    const timeIntervalRef = useRef(null);

    /**
     * Clears all active intervals (progress and time).
     */
    const clearAllIntervals = () => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        if (timeIntervalRef.current) {
            clearInterval(timeIntervalRef.current);
            timeIntervalRef.current = null;
        }
    };

    // Cleanup intervals on component unmount
    useEffect(() => {
        return () => {
            clearAllIntervals();
        };
    }, []);

    /**
     * Handles the file selection event.
     * @param {Object} event - The change event from the file input.
     */
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        clearAllIntervals(); // Clear any ongoing timers
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            setMessage(`Selected file: ${file.name}`);
            setMessageType('info');
            setDownloadUrl(''); // Clear previous download URL
            setProgress(0); // Reset progress
            setEstimatedSeconds(0); // Reset estimated time
        } else {
            setSelectedFile(null);
            setMessage('Please select a valid PDF file (.pdf).');
            setMessageType('error');
            setDownloadUrl('');
            setProgress(0);
            setEstimatedSeconds(0);
        }
    };

    /**
     * Handles the conversion process.
     * This function simulates sending the PDF to a backend server for OCR and DOCX generation.
     */
    const handleConvert = async () => {
        if (!selectedFile) {
            setMessage('Please select a PDF file first.');
            setMessageType('error');
            return;
        }

        setIsLoading(true); // Start loading state
        setMessage('Processing your PDF with advanced OCR...');
        setMessageType('info');
        setDownloadUrl(''); // Clear any previous download URL
        setProgress(0); // Reset progress
        setEstimatedSeconds(0); // Reset estimated time

        // Clear any previous intervals before starting new ones
        clearAllIntervals();

        // Simulate file size impact on time (very rough estimate for frontend display)
        // A 30-40MB file could take 30-60 seconds or more depending on content complexity and server load.
        const fileSizeMB = selectedFile.size / (1024 * 1024);
        let baseProcessingTime = 5000; // Minimum 5 seconds for smaller files
        if (fileSizeMB > 5) {
            baseProcessingTime = 10000; // 10 seconds for medium files
        }
        if (fileSizeMB > 15) {
            baseProcessingTime = 20000; // 20 seconds for larger files
        }
        if (fileSizeMB > 30) {
            baseProcessingTime = 35000; // 35 seconds or more for very large files
        }
        // Add some random jitter to make it feel more dynamic
        const totalSimulatedTime = baseProcessingTime + Math.random() * 10000; // Total time for simulation

        // Initialize estimated time
        setEstimatedSeconds(Math.ceil(totalSimulatedTime / 1000));

        // Simulate progress increment
        let currentProgress = 0;
        const progressIncrement = (100 / (totalSimulatedTime / 100)); // Increment by 1% every 100ms
        progressIntervalRef.current = setInterval(() => {
            currentProgress += progressIncrement;
            if (currentProgress >= 99) { // Stop just before 100 to simulate finalization
                currentProgress = 99;
                clearInterval(progressIntervalRef.current);
            }
            setProgress(Math.round(currentProgress));
        }, 100); // Update progress every 100ms

        // Simulate estimated time countdown
        let remainingTime = Math.ceil(totalSimulatedTime / 1000);
        timeIntervalRef.current = setInterval(() => {
            remainingTime -= 1;
            if (remainingTime <= 0) {
                remainingTime = 0;
                clearInterval(timeIntervalRef.current);
            }
            setEstimatedSeconds(remainingTime);
        }, 1000); // Update estimated time every second

        try {
            // --- SIMULATED BACKEND CALL ---
            // In a real application, you would send `selectedFile` to your Python backend here.
            // Example using fetch API:
            // const formData = new FormData();
            // formData.append('pdfFile', selectedFile);
            //
            // const response = await fetch('/api/convert-pdf', { // Replace with your backend endpoint
            //     method: 'POST',
            //     body: formData,
            // });
            //
            // if (response.ok) {
            //     const blob = await response.blob();
            //     const url = window.URL.createObjectURL(blob);
            //     setDownloadUrl(url);
            //     setMessage('Conversion complete! Your Word document is ready for download.');
            //     setMessageType('success');
            // } else {
            //     const errorText = await response.text();
            //     throw new Error(errorText || response.statusText);
            // }

            // For this virtual demonstration, we'll simulate the delay and outcome.
            await new Promise(resolve => setTimeout(totalSimulatedTime, resolve));

            // Simulate a random chance of failure (for robust error handling demo)
            const randomFailure = Math.random();
            if (randomFailure < 0.2) { // 20% chance of simulated failure
                throw new Error("Simulated conversion failure: An issue occurred during OCR processing or document generation. Please try again or use a different file.");
            }

            // Simulate a successful conversion and provide a dummy download link
            const dummyBlob = new Blob(
                ["This is your simulated Word document content. For a real conversion, a backend server would process your PDF using advanced OCR and generate the actual .docx file. This demo shows the advanced UI and interaction."],
                { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
            );
            const dummyUrl = window.URL.createObjectURL(dummyBlob);
            setDownloadUrl(dummyUrl);
            setMessage('Conversion complete! Your Word document is ready for download.');
            setMessageType('success');
            setProgress(100); // Set progress to 100% on success
            setEstimatedSeconds(0); // Clear estimated time
        } catch (error) {
            setMessage(`Conversion failed: ${error.message}.`);
            setMessageType('error');
            setDownloadUrl('');
            setProgress(0); // Reset progress on error
            setEstimatedSeconds(0); // Clear estimated time
        } finally {
            clearAllIntervals(); // Ensure all intervals are cleared
            setIsLoading(false); // End loading state
        }
    };

    // Determine message styles based on messageType
    const getMessageStyles = () => {
        switch (messageType) {
            case 'success':
                return 'bg-green-50 text-green-800 border-green-300';
            case 'error':
                return 'bg-red-50 text-red-800 border-red-300';
            case 'info':
            default:
                return 'bg-blue-50 text-blue-800 border-blue-300';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center border border-gray-200">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-6 tracking-tight">
                    PDF to Word Converter
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                    Upload your PDF, and our advanced OCR will convert it to an editable Word document.
                    Designed to handle even large files (30-40MB+).
                </p>

                <div className="mb-6">
                    <label
                        htmlFor="pdf-upload"
                        className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-300 ease-in-out transform hover:scale-105 inline-flex items-center space-x-2 shadow-lg"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                        </svg>
                        <span>Choose PDF File</span>
                        <input
                            id="pdf-upload"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={isLoading}
                        />
                    </label>
                </div>

                {message && (
                    <p className={`mb-6 p-3 rounded-lg border ${getMessageStyles()}`}>
                        {message}
                    </p>
                )}

                {isLoading && estimatedSeconds > 0 && (
                    <p className="mb-4 text-sm text-gray-600">
                        Estimated time remaining: <span className="font-bold">{estimatedSeconds} seconds</span>.
                        Processing large files may take longer.
                    </p>
                )}

                {isLoading && (
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-6 relative overflow-hidden shadow-inner">
                        <div
                            className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs font-bold text-gray-700">
                            {progress}%
                        </div>
                    </div>
                )}

                <button
                    onClick={handleConvert}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition duration-300 ease-in-out transform shadow-lg
                                ${selectedFile && !isLoading
                                    ? 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
                                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                }`}
                    disabled={!selectedFile || isLoading}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Converting...
                        </span>
                    ) : (
                        'Convert PDF to Word'
                    )}
                </button>

                {downloadUrl && (
                    <a
                        href={downloadUrl}
                        download="converted_document.docx"
                        className="mt-6 inline-block w-full py-3 px-6 rounded-xl font-semibold text-center
                                   bg-purple-600 hover:bg-purple-700 text-white transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                    >
                        Download Word File
                    </a>
                )}

                <p className="mt-8 text-sm text-gray-500">
                    This is a frontend demonstration. Actual advanced OCR and large file processing
                    require a robust backend server utilizing cloud OCR services.
                </p>
            </div>
        </div>
    );
};

export default App;
