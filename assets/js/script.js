//////////////////////////
///Wiki API Integration///
//////////////////////////
//Initiates an array for local storage use.
var storedSearches = [];
//HTML targets for JS use.
var submitButton = document.querySelector('#search');
var input = document.querySelector('#searchText');
var wikiTextBox = document.querySelector('#wikiText');
var wikiTitleBox = document.querySelector('.wikiTitle');
var wikiLink = document.querySelector('.wikiLink');
var previousSearchButton = document.querySelector('#last_search');
//Allows the search to be disabled.
const disableUi = () => {
    input.disabled = true;
    submitButton.disabled = true;
};
//Enables the search function.
const enableUi = () => {
    input.disabled = false;
    submitButton.disabled = false;
};
//Prevents searches of empty strings.
const isInputEmpty = input => {
    if (!input || input === '') return true;
    return false;
};
//Runs the search wiki and youtube functions on enter press.
const enterKeyPress = (e) => {
    if (e.key === 'Enter') {
        searchArticle();
        searchVideo();
    }
};
//Initiates a variable for the value of the search.
var searchValue = null;
//The variable that is the endpoint of the fetch request.
var endpoint = 'https://en.wikipedia.org/w/api.php';
//An object of parameters for use in axios to create the required wikipedia API fetch request.
var parameters = {
    origin: '*',
    format: 'json',
    action: 'query',
    prop: 'extracts',
    exintro: true,
    explaintext: true,
    generator: 'search',
    gsrlimit: 1,
};
//Sets the article title, textbox and wiki link to the proper values returned by the fetch request.
const wikiResult = results => {
    console.log(results);
    wikiTextBox.textContent = results[0].extract;
    wikiTitleBox.textContent = results[0].articleTitle;
    wikiLink.setAttribute("href", `https://en.wikipedia.org/?curid=${results[0].link}`);
};
//Gets the correct parts of the fetched wiki data.
const getExtract = pages => {
    var results = Object.values(pages).map(page => ({
        extract: page.extract,
        articleTitle: page.title,
        link: page.pageid,
    }));
    wikiResult(results);
};
//Builds the fetch request using axios, disables search function until the fetch operation finishes, 
//pushes the searched string to the storedSearches array, stores the array in local storage, returns the fetched data, 
//and runs an error modal if the return is invalid, then re-enables the search functionality.
const searchArticle = async () => {
    searchValue = input.value;
    if (isInputEmpty(searchValue)) return;
    parameters.gsrsearch = searchValue;
    disableUi();
    try {
        const { data } = await axios.get(endpoint,{ params:parameters });
        if (data.error) throw new Error(data.error.info);
        getExtract(data.query.pages);
        enableUi();
        storedSearches.push(searchValue);
        localStorage.setItem("previousSearch", JSON.stringify(storedSearches));
    } catch (error) {
        $('#modal1').modal('open');
        enableUi();
    }
};
// displayVideo is used to change the video element in the html
let displayVideo;
// saveCurrentData is used to hand over the fetched data over to changeVideo function, instead of fetching multiple times
let saveCurrentData;
const searchVideo = () => {
    currentVideo = 0;
    if (isInputEmpty(searchValue)) return;
    searchValue = input.value;
    disableUi();
    // Fetches video data based on searchValue
    fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${searchValue}&key=AIzaSyApu7PF3orxR1Krl_fgkehmLRmr5jhWPp0`)
    .then(function(response) {
    return response.json();
    })
    .then(function(data) {
    // Pass the data from the fetch to saveCurrentData for later use
    saveCurrentData = data;  
    try {
        // Change to video element in the html to what the user just searched for
        displayVideo = $("#player").attr("src", `https://www.youtube.com/embed/${data.items[0].id.videoId}`);
        console.log(data)
        enableUi();
    } catch (error) {
      $('#modal1').modal('open');
      enableUi();
    }
    })
    // Clears the input value after submitting a search so the user doesn't have to delete anything to search something else
    input.value = '';
}
let currentVideo = 0;
const changeVideo = (event) => {

    // First check what button what pressed, next or prev. Then check to make sure if currentVideo's value is at the min or max index of saveCurrentData's list of returned videos from the fetch.
    if (event.target.textContent.includes("Next") && currentVideo == 4) {

        // If currentVideo's index is at the END of saveCurrentData's list of videos, update the video element in the html but do NOT change currentVideo's value
        displayVideo = $("#player").attr("src", `https://www.youtube.com/embed/${saveCurrentData.items[currentVideo].id.videoId}`);
        return;

    } else if (event.target.textContent.includes("Previous") && currentVideo == 0) {

        // If currentVideo's index is at the START of saveCurrentData's list of videos, update the video element in the html but do NOT change currentVideo's value
        displayVideo = $("#player").attr("src", `https://www.youtube.com/embed/${saveCurrentData.items[currentVideo].id.videoId}`);
        return;

    } else {
        // If currentVideo's value is not already at the min or max index of saveCurrentData's list of videos, just check what button was pressed
        if (event.target.textContent.includes("Next")) {

            // This time currentVideo's value will be INCREMENTED to move on to the NEXT index of videos in saveCurrentData
            currentVideo++;
            // Change the video element in html
            displayVideo = $("#player").attr("src", `https://www.youtube.com/embed/${saveCurrentData.items[currentVideo].id.videoId}`);

        } else {

            // This time currentVideo's value will be DECREMENTED to move on to the PREVIOUS index of videos in saveCurrentData
            currentVideo--;
            // Change the video element in html
            displayVideo = $("#player").attr("src", `https://www.youtube.com/embed/${saveCurrentData.items[currentVideo].id.videoId}`);

        }
    }
}
//Gets the previously searched string from local storage and puts it in the search bar, prevents this action if there are no previous searches.
const searchLast = () => {
    let prevSearch = JSON.parse(localStorage.getItem('previousSearch'));
    console.log(prevSearch);
    if( prevSearch.length > 1) {
        input.value = prevSearch[prevSearch.length - 2];
    }
};
//Changes the displayed video on button press.
let nextVideo = $("#nextVideo").on("click", changeVideo);
let prevVideo = $("#prevVideo").on("click", changeVideo);
//Event handler for all button interaction and pressing enter for search.
const searchEventHandler = () => {
    input.addEventListener('keydown', enterKeyPress);
    submitButton.addEventListener('click', searchArticle);
    submitButton.addEventListener('click', searchVideo);
    previousSearchButton.addEventListener('click', searchLast);
};
//Initiates modals on page load.
$(document).ready(function() {
    $('.modal').modal();
});
//Initiates event handler.
searchEventHandler();
// Devin's youtube API key: AIzaSyApu7PF3orxR1Krl_fgkehmLRmr5jhWPp0
// Gabes youtube API key: AIzaSyBGcs-zAc9WhKvOuKcSsyF8KXUopPe7d6U
//We use multiple API keys as the YouTube API has a limit to the number of requests per day when using the free version. 
//If the videos are failing to load, exchange the API key on line 96.