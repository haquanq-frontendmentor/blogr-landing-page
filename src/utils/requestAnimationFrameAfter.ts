export const requestAnimationFrameAfter = (duration: number, callback: () => void) => {
    let startTime = -1;
    let requestingFrameId = -1;
    const recursiveCallback = (currentTime: number) => {
        if (startTime === -1) startTime = currentTime;
        if (currentTime - startTime >= duration) callback();
        else requestingFrameId = requestAnimationFrame(recursiveCallback);
    };
    requestAnimationFrame(recursiveCallback);
    return () => cancelAnimationFrame(requestingFrameId);
};
