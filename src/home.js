setTimeout(function() {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('home-page').style.display = 'block';
}, 7000);

window.onload = function() {
    const progressBar = document.querySelector('.progress');
    setTimeout(function() {
        progressBar.style.width = '100%';
    }, 100); 
};
