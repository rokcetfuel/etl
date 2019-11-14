import React, {Component} from 'react'
import PageTitle from './partials/PageTitle.js'
import fetchJsonp from 'fetch-jsonp'
import { htmlParser } from '../../Helpers.js';

class Etl extends Component {

  constructor(props) {
    super(props)

    this.state = {
      recipes: [],
      checker: ''
    }

    this.fullProcess = this.fullProcess.bind(this)
    this.getPages = this.getPages.bind(this)

    this.processPages = this.processPages.bind(this)
    this.fetchPage = this.fetchPage.bind(this)
    
    this.processRecipes = this.processRecipes.bind(this)
    this.fetchRecipe = this.fetchRecipe.bind(this)

  }

  fullProcess() {
    this.setState({checker: 'Processing in progress...'})

    this.getPages().then((response) => {
      if (response.pages) {
        this.processPages(response.pages).then((urls) => {
          this.processRecipes(urls).then((data) => {
            this.setState({
              checker: 'Processing finished. Found '+ data.length +' recipes. ',
              recipes: data
            })

            // Tutaj funkcja do wyciagniecia danych bo nie bedzie promisem chyba

            // A potem do zapisania do bazy, byc moze promise?
          })
        })
      } else {
        console.log(response.error)
      }
    }).catch((error) => {
      console.log(error)
    })
  }

  getPages() {
    return new Promise((resolve, refuse) => {

      fetchJsonp('http://www.whateverorigin.org/get?url=' + encodeURIComponent('https://www.skinnytaste.com/recipes/vegetarian'))
      .then((response) => {return response.json()})
      .then((json) => {

        let recipesHTML = htmlParser.parseFromString(json.contents, "text/html")
        let recipesContent = recipesHTML.getElementById('content')
        let recipesLastPage = recipesContent.querySelector('.nav-links .dots').nextElementSibling.innerHTML

        if (recipesLastPage) resolve({pages: recipesLastPage})
        else resolve({error: 'Could not find amount of pages.'})

      }).catch((error) => {
        console.log('Fetch in getPages failed. ' + error)
        refuse()
      })
    })
  }

  fetchPage(page) {
    return new Promise((good, bad) => {
      fetchJsonp('http://www.whateverorigin.org/get?url=' + encodeURIComponent('https://www.skinnytaste.com/recipes/vegetarian/page/' + page))
      .then((response) => {return response.json()})
      .then((json) => {

        let recipesHTML = htmlParser.parseFromString(json.contents, "text/html")
        let recipesContent = recipesHTML.getElementById('content')
        let recipesArchives = recipesContent.getElementsByClassName('archives')[0].children
        let recipesURLs = []

        for (var i = 1; i < recipesArchives.length - 1; i++) {
          let recipeURL = recipesArchives[i].querySelector('.archive-post > a').href
          recipesURLs.push(recipeURL)
        }

        if (recipesURLs.length) good({data: recipesURLs})
        else good({error: 'Recipes URLs of page ' + page + ' did not load into the array.'})

      }).catch((error) => {
        console.log('Fetch in downloadRecipesHTML on page ' + page + ' failed. ' + error)
        bad()
      })
    })
  }


  fetchRecipe(recipeURL) {
    return new Promise((resolve, reject) => {
      fetchJsonp('http://www.whateverorigin.org/get?url=' + encodeURIComponent(recipeURL))
      .then((response) => {return response.json()})
      .then((json) => {

        let recipeHTML = htmlParser.parseFromString(json.contents, "text/html")
        let recipeContainer = recipeHTML.getElementsByClassName('wprm-recipe-container')[0].innerHTML

        if (recipeContainer) {
          // Answers with recipe container, 
          // you'll get data from container in the next step
          resolve({data: recipeContainer})
        } else {
          resolve({error: 'Cannot find recipe container'})
        }

      }).catch((error) => {
        console.log(error)
        reject()
      })
    })
  }


  async processRecipes(array) {
    let recipes = []
    let i = 0
    for (const item of array) {
      i++
      this.setState({checker: 'Procesing recipe ' + i + '...'})
      await this.fetchRecipe(item).then((response) => {
        if (response.data) recipes.push(response.data)
        else console.log(response.error)
      })
    }
    return recipes
  }


  async processPages(pages) {
    let allURLs = []
    // "pages" instead of number
    for (let i = 1; i < 2; i++) {
      this.setState({checker: 'Procesing page ' + i + '...'})
      await this.fetchPage(i).then((response) => {
        if (response.data) allURLs.push.apply(allURLs, response.data)
        else console.log(response.error)
      })
    }
    return allURLs
  }


  render() {
    return (
	    <div className="page page__etl">
      	<PageTitle title="Etl"/>
      	<div className="page-content">
          
          <div className="etl__home-buttons">
            <div className="etl__home-buttons__wrap">
        		  <button onClick={this.fullProcess} className="btn">Full ETL Process</button>
            </div>
            <div className="etl__home-buttons__wrap">
        		  <button disabled className="btn">ETL Step by step</button>
            </div>
            <p>{this.state.checker}</p>
            <p>{this.state.recipes}</p>
          </div>

      	</div>
    	</div>
    );
  }
}

export default Etl;
