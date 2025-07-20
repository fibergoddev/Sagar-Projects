/**
 * @file Manages all ad-related logic for the PadhaiLikhai application.
 * @author Sagar Raj
 * @version 1.0
 */

import { allDOMElements } from './ui.js';

// --- Ad System Resources ---
const adConfig = {
    directLink: 'https://medievalkin.com/z3cci824?key=3ad08b148f03cc313b5357f5e120feaf',
    bottomBar: {
        options: { key: '7f09cc75a479e1c1557ae48261980b12', format: 'iframe', height: 50, width: 320, params: {} },
        invoke: '//www.highperformanceformat.com/7f09cc75a479e1c1557ae48261980b12/invoke.js'
    },
    bigBar: {
        options: { key: 'de366f663355ebaa73712755e3876ab8', format: 'iframe', height: 250, width: 300, params: {} },
        invoke: '//www.highperformanceformat.com/de366f663355ebaa73712755e3876ab8/invoke.js'
    },
    nativeBanner: {
        invoke: '//pl27121901.profitableratecpm.com/5a3a56f258731c59b0ae000546a15e25/invoke.js',
        containerId: 'container-5a3a56f258731c59b0ae000546a15e25'
    },
    rightSideBar: {
        options: { key: 'de366f663355ebaa73712755e3876ab8', format: 'iframe', height: 600, width: 120, params: {} },
        invoke: '//www.highperformanceformat.com/de366f663355ebaa73712755e3876ab8/invoke.js'
    }
};

/**
 * Dynamically injects a standard ad script into a container.
 * @param {HTMLElement} container The container to inject the ad into.
 * @param {object} adDetails The ad configuration from the `adConfig` object.
 */
const injectAdScript = (container, adDetails) => {
    if (!container) return;
    container.innerHTML = '';
    const optionsScript = document.createElement('script');
    optionsScript.type = 'text/javascript';
    optionsScript.innerHTML = `atOptions = ${JSON.stringify(adDetails.options)};`;
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = adDetails.invoke;
    container.appendChild(optionsScript);
    container.appendChild(invokeScript);
};

/**
 * Loads the right side ad.
 */
const loadRightSideAd = () => {
    injectAdScript(allDOMElements.rightAdContent, adConfig.rightSideBar);
};

/**
 * Loads all the main ads for the application.
 */
export const loadAds = () => {
    injectAdScript(allDOMElements.persistentAdBanner, adConfig.bottomBar);
    const adSlot1 = document.createElement('div');
    const adSlot2 = document.createElement('div');
    allDOMElements.adGrid.innerHTML = '';
    allDOMElements.adGrid.appendChild(adSlot1);
    allDOMElements.adGrid.appendChild(adSlot2);
    injectAdScript(adSlot1, adConfig.bigBar);
    loadRightSideAd();
};

/**
 * Shows the interstitial ad modal before navigating to a new page.
 * @param {string} targetUrl The URL to navigate to after the ad.
 */
export const showInterstitialAd = (targetUrl) => {
    const { interstitialAdModal, interstitialAdContainer, skipAdButton, closeAdModalBtn } = allDOMElements;
    injectAdScript(interstitialAdContainer, adConfig.bigBar);
    interstitialAdModal.classList.remove('hidden');
    let timeLeft = 4;
    skipAdButton.textContent = `Skip Ad in ${timeLeft}s`;
    skipAdButton.disabled = true;
    const timerInterval = setInterval(() => {
        timeLeft--;
        skipAdButton.textContent = `Skip Ad in ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            skipAdButton.disabled = false;
            skipAdButton.textContent = 'Skip Ad';
        }
    }, 1000);
    const closeFunction = (navigate = false) => {
        clearInterval(timerInterval);
        interstitialAdModal.classList.add('hidden');
        if (navigate && targetUrl) {
            window.location.href = targetUrl;
        }
    };
    skipAdButton.onclick = () => !skipAdButton.disabled && closeFunction(true);
    closeAdModalBtn.onclick = () => closeFunction(false);
};
