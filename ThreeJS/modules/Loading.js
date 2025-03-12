import * as THREE from 'three';

/**
 * Creates a loading manager to track asset loading progress
 * @returns {THREE.LoadingManager} The created loading manager
 */
export function setupLoadingManager() {
    const loadingManager = new THREE.LoadingManager();
    
    // Loading start
    loadingManager.onStart = function(url, itemsLoaded, itemsTotal) {
        console.log(`Started loading: ${url}`);
        console.log(`Loading ${itemsTotal} items`);
    };
    
    // Loading progress
    loadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
        const progressPercent = Math.round((itemsLoaded / itemsTotal) * 100);
        console.log(`Loading progress: ${progressPercent}%`);
        document.getElementById('progress').textContent = `${progressPercent}%`;
    };
    
    // Loading complete
    loadingManager.onLoad = function() {
        console.log('Loading complete!');
        document.getElementById('loading').style.opacity = 0;
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 500);
    };
    
    // Loading error
    loadingManager.onError = function(url) {
        console.error(`Error loading: ${url}`);
    };
    
    return loadingManager;
}