import express, { response } from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const cocktailDbEndpoint = "https://www.thecocktaildb.com/api/json/v1/1/";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.post("/random", async (req, res) => {
    try {
        const response = await axios.get(cocktailDbEndpoint + "random.php");
        const randomDrink = response.data.drinks[0];
        // pass this random drink that we get using the API random endpoint to the homepage where it will be redirected to cocktail page
        res.render("home.ejs", { cocktail: randomDrink });
    } catch (error) {
        handleError(error, res);
    }
});

app.post("/search", async (req, res) => {
    
    try {
        const response = await axios.get(cocktailDbEndpoint + "search.php?s=" + req.body.search);
        // catch the `drinks` property (JS Object)
        const searchResult = response.data.drinks;
        // configure the data that will be sent to templates
        const data = configData(searchResult, req.body);
        // render home page wth this data
        res.render("home.ejs", data);
    } catch (error) {
        handleError(error, res);
    }
});

app.post("/cocktail", async (req, res) => {
    try {
        const response = await axios.get(cocktailDbEndpoint + "lookup.php?i=" + req.body.drinkID);
        // catch the `drinks` property (JS Object)
        const thisDrink = response.data.drinks[0];
        // pass this specific drink that we get using the API id endpoint to the homepage where it will be redirected to cocktail page
        res.render("home.ejs", { cocktail: thisDrink });
    } catch (error) {
        handleError(error, res);
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});



// <---------------------------------------- Functions ---------------------------------------->
function handleError(error, res) {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error: Server responded with an error status');
        res.status(500).send('Internal Server Error');
        // Avoid logging error.response.data, error.response.status, or error.response.headers
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error('Error: Request made but no response received');
        res.status(500).send('Internal Server Error');
        // Avoid logging error.request directly
    } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error: Something went wrong while processing the request');
        res.status(500).send('Internal Server Error');
        // Avoid logging error.message directly
    }        
}

function configData(result, body) {
    const thisPage = Number(body.page);
    const totalDrinksPerPage = 15;
    const data = {
        // if the result was null means no cocktail was found so send this boolean var `notFoundMessage`
        notFoundMessage: (result === null) ? "No cocktail matches your search" : null,
        // pass the result to home page (might be one drink only cz search name was exact)
        search: result,
        // pass the search query from user input (req.body)
        searchQuery: body.search,
        // current page is passed through post method as hidden input, convert it to number instead of string
        currentPage: thisPage,
        // start drink is the starting drink index of this current page `(page_number - 1) * items_per_page`
        startDrink: (thisPage - 1) * totalDrinksPerPage,
        // drinksPerPage is the total drinks per page `15`
        drinksPerPage: totalDrinksPerPage,
        // 15 drinks per page so pass the total pages number through dividing by 15 and getting the ceiling
        totalPages: (result !== null) ? Math.ceil(result.length / totalDrinksPerPage) : null,
    };
    return data;
}