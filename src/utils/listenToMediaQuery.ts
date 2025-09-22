export const listenToMediaQuery = (mediaQuery: string) => {
    const media = window.matchMedia(mediaQuery);

    let matches = media.matches;
    media.addEventListener("change", (e) => {
        matches = e.matches;
    });

    return () => matches;
};
