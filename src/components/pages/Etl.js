import React, {Component} from 'react'
import PageTitle from './partials/PageTitle.js'
import fetchJsonp from 'fetch-jsonp'
import { htmlParser, decodeHtml } from '../../Helpers.js'
import db, { keys, TIME_SELECTOR_M, TIME_SELECTOR_H } from '../../Database.js'

const RECIPES_URL = 'https://www.skinnytaste.com/recipes/vegetarian'
const PHASE_E = 'Extracting'
const PHASE_T = 'Transforming'
const PHASE_L = 'Loading'

class Etl extends Component {

  fetchController = new AbortController()

  constructor(props) {
    super(props)

    this.state = {
      recipes: [],
      checkerE: '',
      checkerT: '',
      checkerL: '',
      inFullProcess: false,
      inStepsProcess: false,
      startedE: false,
      startedT: false,
      startedL: false,
      finishedE: false,
      finishedT: false,
      finishedL: false,
    }

    this.fullProcess = this.fullProcess.bind(this)
    this.getPages = this.getPages.bind(this)

    this.processPages = this.processPages.bind(this)
    this.fetchPage = this.fetchPage.bind(this)
    
    this.processRecipes = this.processRecipes.bind(this)
    this.fetchRecipe = this.fetchRecipe.bind(this)

    this.processDetails = this.processDetails.bind(this)
    this.getRecipeDetails = this.getRecipeDetails.bind(this)

    this.processSaving = this.processSaving.bind(this)
    this.checkBeforeSave = this.checkBeforeSave.bind(this)

    this.finishPhaseE = this.finishPhaseE.bind(this)
    this.finishPhaseT = this.finishPhaseT.bind(this)
    this.finishPhaseL = this.finishPhaseL.bind(this)
  }

  componentDidMount() {
    this.mounted = true
  }

  componentWillUnmount() {
    this.fetchController.abort()
    this.mounted = false
  }

  /* 
   *  Full ETL process
   */
  fullProcess() {

    if (this.mounted) {
      this.setState({
        inFullProcess: true,
        startedE: true,
        checkerE: 'Extracting in progress...'
      })
    }

    this.getPages()
    .then((response) => this.processPages(response))
    .then((response) => this.processRecipes(response))
    .then((response) => this.finishPhaseE(response))
    .then((response) => this.processDetails(response))
    .then((response) => this.finishPhaseT(response))
    .then((response) => this.processSaving(response))

    .catch((error) => {
      console.log(error)
    })
  }

  /* 
   *  End of E Phase
   */
  finishPhaseE(data) {
    if (this.mounted) {
      this.setState({
        recipes: data,
        checkerE: '',
        finishedE: true
      })
    }
  }

  /* 
   *  End of T Phase
   */
  finishPhaseT(data) {
    if (this.mounted) {

      if (!this.state.error) {
        this.setState({
          recipes: data,
          checkerT: '',
          finishedT: true
        })
      } else {
        this.setState({
          checkerT: 'Transformation failed - did not receive recipes data. Restart the process.'
        })
      }
    }
  }

  /* 
   *  End of L Phase
   */
  finishPhaseL(data) {
    if (this.mounted) {
      this.setState({
        checkerL: '',
        finishedL: true,
      })
    }
  }

  /* 
   *  Get amount of pages 
   */
  getPages() {

    return new Promise((resolve, refuse) => {
      // Fetch recipes from first page
      fetchJsonp('http://www.whateverorigin.org/get?url=' + encodeURIComponent(RECIPES_URL),
        {signal: this.fetchController.signal})
      .then((response) => {return response.json()})
      .then((json) => {

        // Json data into HTML
        let recipesHTML = htmlParser.parseFromString(json.contents, "text/html")
        let recipesContent = recipesHTML.getElementById('content')

        // Get amount of available pages of recipes
        let recipesLastPage = recipesContent.querySelector('.nav-links .dots').nextElementSibling.innerHTML

        // If we found the amount all is ok and resolve
        // If we didn't find the amount display information
        if (recipesLastPage) resolve(recipesLastPage)
        else {
          if (this.mounted) {
            this.setState({checkerE: 'Failed to get amount of recipes pages.'})
          }
          refuse()
        }
      }).catch((error) => {
        if (this.mounted) {
          this.setState({checkerE: 'Failed to get amount of recipes pages.'})
          console.log('Fetch in getPages failed. ' + error)
        }
        refuse()
      })
    })
  }

  /* 
   *  Get single page HTML
   */
  fetchPage(page) {

    return new Promise((resolve, refuse) => {
      fetchJsonp('http://www.whateverorigin.org/get?url=' + encodeURIComponent(RECIPES_URL + '/page/' + page), 
        {signal: this.fetchController.signal})
      .then((response) => {return response.json()})
      .then((json) => {

        // Json data into HTML
        let recipesHTML = htmlParser.parseFromString(json.contents, "text/html")
        let recipesContent = recipesHTML.getElementById('content')

        // Get children on recipes container - each is a single recipe
        let recipesArchives = recipesContent.getElementsByClassName('archives')[0].children
        let recipesURLs = []

        // For each recipe, get URL to said recipe an add to array
        for (var i = 1; i < recipesArchives.length - 1; i++) {
        //for (var i = 1; i < 10; i++) {
          let recipeURL = recipesArchives[i].querySelector('.archive-post > a').href
          recipesURLs.push(recipeURL)
        }

        // If array isn't empty - resolve with data: URLs array
        if (recipesURLs.length) resolve({data: recipesURLs})

        // If array is empty - resolve with error, so the loop doesn't break
        else resolve({error: 'Recipes URLs of page ' + page + ' did not load into the array.'})

      }).catch((error) => {
        if (this.mounted) {
          this.setState({checkerE: 'Failed to get data from page ' + page + '.'})
          console.log('Fetch in downloadRecipesHTML on page ' + page + ' failed. ' + error)
        }
        refuse()
      })
    })
  }

  /* 
   *  Get single recipe HTML
   */
  fetchRecipe(recipeURL) {
    return new Promise((resolve, refuse) => {
      fetchJsonp('http://www.whateverorigin.org/get?url=' + encodeURIComponent(recipeURL), 
        {signal: this.fetchController.signal})
      .then((response) => {return response.json()})
      .then((json) => {

        // Json data into HTML
        let recipeHTML = htmlParser.parseFromString(json.contents, "text/html")
        let recipeContainer = recipeHTML.getElementsByClassName('wprm-recipe-container')[0].outerHTML

        if (recipeContainer) {
          // Answers with recipe container, 
          // you'll get data from container in the next step
          resolve({data: recipeContainer})
        } else {
          resolve({error: 'Cannot find recipe container at ' + recipeURL})
        }

      }).catch((error) => {
        if (this.mounted) {
          this.setState({checkerE: 'Failed to get data from URL: ' + recipeURL})
          console.log('Failed to get data from URL: '+ recipeURL + ' Error: '+ error)
        }
        refuse()
      })
    })
  }

  /* 
   *  Get all recipes data
   */
  async processRecipes(array) {
    let recipes = []
    let i = 0
    for (const item of array) {
      i++
      if (this.mounted) {
        this.setState({checkerE: 'Procesing recipe ' + i + '...'})
      }
      await this.fetchRecipe(item).then((response) => {

        // If recipe returned data, add it to recipes array
        if (response.data) recipes.push(response.data)

        // If recipe returned error, log it in console
        else console.log(response.error)
      })
    }
    return recipes
  }

  /* 
   *  Get URLs from all pages
   */
  async processPages(pages) {
    let allURLs = []
    // Final product - "pages" instead of number in the middle !!!
    for (let i = 1; i < 2; i++) {
      if (this.mounted) {
        this.setState({checkerE: 'Procesing page ' + i + '...'})
      }
      await this.fetchPage(i).then((response) => {

        // If page returned data, add it to recipes URLs array
        if (response.data) allURLs.push.apply(allURLs, response.data)

        // If page returned error, log it in console
        else console.log(response.error)
      })
    }
    return allURLs
  }

  /* 
   *  Get data from recipe HTML into an array
   */
  getRecipeDetails(recipeCode) {
    let recipe = {}
    let recipeHtml = htmlParser.parseFromString(recipeCode, "text/html")

    // If no problem with keys
    if (keys.length > 0) {

      // For each variable of this recipe
      for (let i = 0; i < keys.length; i++) {

        // Database record ID has no selector
        if (keys[i].selector) {

          // If key type is class just take whatever's in the element with said class
          if (keys[i].selectorType === 'class') {
            let elText = recipeHtml.getElementsByClassName(keys[i].selector)[0]
            let elKey = keys[i].field

            if (elText) {
              elText = elText.innerHTML

              // If variable type is numeric or float, parse it
              if (keys[i].dataType === 'num') {
                elText = parseInt(elText)
              } else if (keys[i].dataType === 'float') {
                elText = parseFloat(elText)
              }
            } else {
              if (keys[i].dataType === 'num') {
                elText = 0
              } else if (keys[i].dataType === 'float') {
                elText = 0
              } else {
                elText = ''
              }
            }

            

            // Add to this recipe array
            recipe[elKey] = decodeHtml(elText)
          } 

          // If key type is time, count hours and minutes
          else if (keys[i].selectorType === 'time') {
            let el = recipeHtml.getElementsByClassName(keys[i].selector)[0]
            let elKey = keys[i].field

            if (el) {
              let hrContainer = el.getElementsByClassName(TIME_SELECTOR_H)[0]
              let minContainer = el.getElementsByClassName(TIME_SELECTOR_M)[0]
              let hr = 0
              let min = 0

              // Convert hours into minutes
              if (hrContainer) hr = hrContainer.innerHTML * 60
              if (minContainer) min = minContainer.innerHTML
              let totalTime = parseInt(hr) + parseInt(min)

              recipe[elKey] = totalTime
            } else {
              let totalTime = 0
              recipe[elKey] = totalTime
            }
          }

          // If key type is data, we take data from class element
          else if (keys[i].selectorType === 'data') {
            let el = recipeHtml.getElementsByClassName(keys[i].selector)[0]
            let elData = el.dataset.recipeId
            let elKey = keys[i].field
            recipe[elKey] = elData
          }
        }
      }
    }

    // When all keys handled, return the array
    return recipe
  }

  /* 
   *  Get data from recipes HTML into array of arrays
   */
  processDetails() {
    if (this.mounted) {
      this.setState({
        startedT: true,
        checkerT: 'Transformation in progress...'
      })
    }

    let recipes = this.state.recipes
    let count = recipes.length
    let recipesGood = []

    // If recipes in state are ok
    if ((count > 0) && this.mounted) {
      for (let i = 0; i < count; i++) {

        // trasform each recipeHTML into data in array
        let recipeHtml = recipes[i]
        let recipeGood = this.getRecipeDetails(recipeHtml)
        if (recipeGood) recipesGood.push(recipeGood)
      }
    } else {
      this.setState({
        error: true
      })
    }
    return recipesGood
  }

  /* 
   *  Add, update or delete recipe in database
   */
  checkBeforeSave(recipe) {

    return new Promise((resolve, refuse) => {

      db.table('recipes').add(recipe)
      .then(() => {
        console.log('Added.')
        resolve()
      })
      .catch((error) => {
        console.log(error)
        refuse()
      })
    })

  }

  /* 
   *  Save recipes to database
   */
  async processSaving() {
    if (this.mounted) {
      this.setState({
        startedL: true,
        checkerL: 'Loading records to database...'
      })
    }

    let recipes = this.state.recipes
    let i = 0

    // Each recipe:
    // Check ID
    // -- if it doesn't exist, save it, no problem
    // -- if it exists:
    // ---- update everything except ID
    // At the end: New __, Updated __, Deleted __

    for (let recipe of recipes) {
      i++

      if (this.mounted) {
        this.setState({checkerL: 'Checking recipe ' + i + '...'})
      }

      await this.checkBeforeSave(recipe).then((response) => {


      })
    }


  }


  /* 
   *  RENDER
   */
  render() {
    return (
	    <div className="page page__etl">
      	<PageTitle title="Etl"/>
      	<div className="page-content">
          
          {!this.state.inFullProcess ? 
            <div className="etl__buttons">
              <div className="etl__buttons__wrap">
          		  <button onClick={this.fullProcess} className="btn">Full ETL Process</button>
              </div>
              <div className="etl__buttons__wrap">
          		  <button disabled className="btn">ETL Step by step</button>
              </div>
            </div>
          : 
            <div className="etl__process">

              {this.state.startedE ? 
                <div className="etl__process_phase">
                  <div className="etl__process_phase-title">
                    <span>{PHASE_E}</span> 
                  </div>
                  <div className="etl__process_info">
                    <div className="etl__process_in-progress">
                      {this.state.checkerE}
                    </div>

                    {this.state.finishedE ? 
                      <div className="etl__process_finished">
                        <div className="etl__process_finished-alert">
                          Processing has finished.
                        </div> 
                        <div className="etl__process_finished-details">
                          Found <strong>{this.state.recipes.length}</strong> records.
                        </div>
                      </div>
                    : '' }

                  </div>
                </div>
              : '' }

              {this.state.startedT ? 
                <div className="etl__process_phase">
                  <div className="etl__process_phase-title">
                    <span>{PHASE_T}</span> 
                  </div>
                  <div className="etl__process_info">
                    <div className="etl__process_in-progress">
                      {this.state.checkerT}
                    </div>

                    {this.state.finishedT ? 
                      <div className="etl__process_finished">
                        <div className="etl__process_finished-alert">
                          Transformation finished.
                        </div> 
                        <div className="etl__process_finished-details">
                          Transformed <strong>{this.state.recipes.length}</strong> records.
                        </div>
                      </div>
                    : '' }

                  </div>
                </div>
              : '' }

              {this.state.startedL ? 
                <div className="etl__process_phase">
                  <div className="etl__process_phase-title">
                    <span>{PHASE_L}</span> 
                  </div>
                  <div className="etl__process_info">
                    <div className="etl__process_in-progress">
                      {this.state.checkerL}
                    </div>

                    {this.state.finishedL ? 
                      <div className="etl__process_finished">
                        <div className="etl__process_finished-alert">
                          Alert L.
                        </div> 
                        <div className="etl__process_finished-details">
                          Details L.
                        </div>
                      </div>
                    : '' }

                  </div>
                </div>
              : '' }
            </div>
          }
      	</div>
    	</div>
    )
  }
}

export default Etl
