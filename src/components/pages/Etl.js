import React, {Component} from 'react'
import PageTitle from './partials/PageTitle.js'
import fetchJsonp from 'fetch-jsonp'
import { htmlParser, decodeHtml } from '../../Helpers.js'
import db, { keys, TIME_SELECTOR_M, TIME_SELECTOR_H } from '../../Database.js'
import { NavLink } from 'react-router-dom'

const RECIPES_URL = 'https://www.skinnytaste.com/recipes/vegetarian'
const PHASE_E = 'Extracting'
const PHASE_T = 'Transforming'
const PHASE_L = 'Loading'
let PROXY_URL = 'http://www.whateverorigin.org/get?url='

const fetch = window.fetch.bind(window)
const useFetch = {
  'fetch': fetch,
  'fetchJsonp': fetchJsonp
}

class Etl extends Component {

  constructor(props) {
    super(props)

    this.state = {

      // Old recipes in the database
      recipesInDb: [],

      // New recipes to add and update
      recipes: [],

      // Handle resetting
      resetting: false,
      doingAsync: false,

      // Proxy?
      withProxy: true,

      // Count recipes 
      newRecipes: 0,
      updatedRecipes: 0,

      // Values
      valuePages: 1,
      valueRecipes: 10,

      // Steps variables
      extractedData: false,
      transformedData: false,

      // Alerts
      checkerE: '',
      checkerT: '',
      checkerL: '',

      // For rendering
      inFullProcess: false,
      inStepsProcess: false,
      startedE: false,
      startedT: false,
      startedL: false,
      finishedE: false,
      finishedT: false,
      finishedL: false,
      error: false,
    }

    this.handlePagesChange = this.handlePagesChange.bind(this);
    this.handleRecipesChange = this.handleRecipesChange.bind(this);
    this.handleProxyChange = this.handleProxyChange.bind(this);

    this.fullProcess = this.fullProcess.bind(this)
    this.getPages = this.getPages.bind(this)

    this.processPages = this.processPages.bind(this)
    this.fetchPage = this.fetchPage.bind(this)
    
    this.processRecipes = this.processRecipes.bind(this)
    this.fetchRecipe = this.fetchRecipe.bind(this)

    this.processDetails = this.processDetails.bind(this)
    this.getRecipeDetails = this.getRecipeDetails.bind(this)

    this.startSaving = this.startSaving.bind(this)
    this.processSaving = this.processSaving.bind(this)
    this.checkBeforeSave = this.checkBeforeSave.bind(this)

    this.finishPhaseE = this.finishPhaseE.bind(this)
    this.finishPhaseT = this.finishPhaseT.bind(this)
    this.finishPhaseL = this.finishPhaseL.bind(this)

    this.stepsProcess = this.stepsProcess.bind(this)
    this.stepE = this.stepE.bind(this)
    this.stepT = this.stepT.bind(this)
    this.stepL = this.stepL.bind(this)

    this.resetComponent = this.resetComponent.bind(this)
  }

  componentDidMount() {
    this.mounted = true
  }

  componentWillUnmount() {
    this.mounted = false
  }

  resetComponent() {

    if (this.mounted) {

      this.setState({

        // Resetting
        resetting: true,
        doingAsync: false,

        // Old recipes in the database
        recipesInDb: [],

        // New recipes to add and update
        recipes: [],

        // Count recipes 
        newRecipes: 0,
        updatedRecipes: 0,

        // Values
        // Maybe let's not reset values :)
        // valuePages: 1,
        // valueRecipes: 10,
        // withProxy: true,

        // Steps variables
        extractedData: false,
        transformedData: false,

        // Alerts
        checkerE: '',
        checkerT: '',
        checkerL: '',

        // For rendering
        inFullProcess: false,
        inStepsProcess: false,
        startedE: false,
        startedT: false,
        startedL: false,
        finishedE: false,
        finishedT: false,
        finishedL: false,
        error: false

      })

      if (!this.state.doingAsync) {
        // If so, resetting state ends here
        this.setState({resetting: false}, function() {
          console.log('Reset NOT in loop, state should be false:  '+this.state.resetting)
        })
      } else {
        // If so, resetting state ends in three specific functions
        // Because it needs to break async functions
        console.log('Reset happened IN loop, now it is: '+this.state.resetting)
      }
    }
  }

  handlePagesChange(e) {
    this.setState({valuePages: e.target.value})
  }

  handleRecipesChange(e) {
    this.setState({valueRecipes: e.target.value})
  }

  handleProxyChange(e) {
    this.setState({withProxy: !this.state.withProxy})
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
    .then((response) => this.startSaving(response))
    .then((response) => this.processSaving(response))
    .then((response) => this.finishPhaseL(response))
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
        finishedE: true,
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
          finishedT: true,
        })
      } else {
        if (this.mounted) {
          this.setState({
            checkerT: 'Transformation failed - did not receive recipes data. Restart the process.'
          })
        }
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
        newRecipes: data.newRecipes,
        updatedRecipes: data.updatedRecipes
      })
    }
  }

  /* 
   *  Get amount of pages 
   */
  getPages() {

    return new Promise((resolve, refuse) => {
      this.setState({doingAsync: true}, function() {

        let fetchFunc = 'fetchJsonp'
        let fetchUrlBase = RECIPES_URL
        let fetchUrl = PROXY_URL + encodeURIComponent(fetchUrlBase)
        if (!this.state.withProxy) {
          fetchUrl = fetchUrlBase
          fetchFunc = 'fetch'
        }

        // Fetch recipes from first page 
        useFetch[fetchFunc](fetchUrl)
        .then((response) => {
          if (!this.state.withProxy) return response.clone().text()
          else return response.json()
        })
        .then((json) => {

          let dataHere = json.contents 
          if (!this.state.withProxy) dataHere = json

          // Data into HTML
          let recipesHTML = htmlParser.parseFromString(dataHere, "text/html")
          let recipesContent = recipesHTML.getElementById('content')

          // Get amount of available pages of recipes
          let recipesLastPage = recipesContent.querySelector('.nav-links .dots').nextElementSibling.innerHTML

          // If we found the amount all is ok and resolve
          // If we didn't find the amount display information
          if (recipesLastPage) {
            if (this.state.resetting) {
              this.setState({resetting: false, doingAsync: false}, function() {
                refuse('Reset in getPages.')
              })
            } else {
              resolve(recipesLastPage)
            }
          } else {
            if (this.mounted) {
              this.setState({
                checkerE: 'Failed to get amount of recipes pages. Probably a proxy or CORS error. Check the console or try again.',
                doingAsync: false
              })
              refuse()
            }
          }
        }).catch((error) => {
          if (this.mounted) {
            this.setState({
              checkerE: 'Failed to get amount of recipes pages. Probably a proxy or CORS error. Check the console or try again.',
              doingAsync: false
            })
            refuse('Fetch in getPages failed. ' + error)
          }
        })
      })
    	
    })
  }

  /* 
   *  Get single page HTML
   */
  fetchPage(page) {

    return new Promise((resolve, refuse) => {

      let fetchFunc = 'fetchJsonp'
      let fetchUrlBase = RECIPES_URL + '/page/' + page
      let fetchUrl = PROXY_URL + encodeURIComponent(fetchUrlBase)
      if (!this.state.withProxy) {
        fetchUrl = fetchUrlBase
        fetchFunc = 'fetch'
      }

      // Fetch recipes from first page 
      useFetch[fetchFunc](fetchUrl)
      .then((response) => {
        if (!this.state.withProxy) return response.clone().text()
        else return response.json()
      })
      .then((json) => {

        let dataHere = json.contents 
        if (!this.state.withProxy) dataHere = json

        // Data into HTML
        let recipesHTML = htmlParser.parseFromString(dataHere, "text/html")
        let recipesContent = recipesHTML.getElementById('content')

        // Get children on recipes container - each is a single recipe
        let recipesArchives = recipesContent.getElementsByClassName('archives')[0].children
        let recipesURLs = []

        // Recipes amount
        let intValueRecipes = parseInt(this.state.valueRecipes)
        let recipesAmount = intValueRecipes + 1
        recipesAmount = parseInt(recipesAmount)

        //for (var i = 1; i < recipesArchives.length - 1; i++) {
        for (var i = 1; i < recipesAmount; i++) {
          let recipeURL = recipesArchives[i].querySelector('.archive-post > a').href
          recipesURLs.push(recipeURL)
        }

        // If array isn't empty - resolve with data: URLs array
        if (recipesURLs.length) {
          if (this.state.resetting) {
            this.setState({resetting: false})
            refuse('Reset happened in fetchPage.') 
          } else {
            resolve({data: recipesURLs})
          }
        } // If array is empty - resolve with error, so the loop doesn't break
        else {
          if (this.state.resetting) {
            this.setState({resetting: false})
            refuse('Reset happened in fetchPage.') 
          } else {
            resolve({error: 'Recipes URLs of page ' + page + ' did not load into the array.'})
          }
        }

      }).catch((error) => {
        if (this.mounted) {
          this.setState({checkerE: 'Failed to get data from page ' + page + '. Probably a proxy or CORS error. Check the console or try again.'})
          refuse('Fetch in downloadRecipesHTML on page ' + page + ' failed. ' + error)
        }
      })
    })
  }

  /* 
   *  Get single recipe HTML
   */
  fetchRecipe(recipeURL) {
    return new Promise((resolve, refuse) => {
    	
      let fetchFunc = 'fetchJsonp'
      let fetchUrlBase = recipeURL
      let fetchUrl = PROXY_URL + encodeURIComponent(fetchUrlBase)
      if (!this.state.withProxy) {
        fetchUrl = fetchUrlBase
        fetchFunc = 'fetch'
      }

      // Fetch recipes from first page 
      useFetch[fetchFunc](fetchUrl)
      .then((response) => {
        if (!this.state.withProxy) return response.clone().text()
        else return response.json()
      })
      .then((json) => {

        let dataHere = json.contents 
        if (!this.state.withProxy) dataHere = json

        // Data into HTML
        let recipeHTML = htmlParser.parseFromString(dataHere, "text/html")
        let recipeContainer = recipeHTML.getElementsByClassName('wprm-recipe-container')[0].outerHTML

        if (recipeContainer) {
          // Answers with recipe container, 
          // you'll get data from container in the next step
          if (this.state.resetting) {
            this.setState({resetting: false})
            refuse('Reset in fetchRecipe.')
          } else {
            resolve({data: recipeContainer})
          }
        } else {
          if (this.state.resetting) {
            this.setState({resetting: false})
            refuse('Reset in fetchRecipe.')
          } else {
            resolve({error: 'Cannot find recipe container at ' + recipeURL})
          }
        }

      }).catch((error) => {
        if (this.mounted) {
          this.setState({checkerE: 'Probably a proxy or CORS error. Check the console or try again. Failed to get data from URL: ' + recipeURL})
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
    let length = array.length

    for (const item of array) {
      this.setState({doingAsync: true})
      i++

      if (this.mounted) {
        this.setState({checkerE: 'Extracting recipe ' + i + '...'})
      }

      await this.fetchRecipe(item).then((response) => {

        // If recipe returned data, add it to recipes array
        if (response.data) recipes.push(response.data)

        // If recipe returned error, log it in console
        else console.log(response.error)
      })

      if (i === length) {
        this.setState({doingAsync: false}, function() {
          console.log('Loop ended, now it is: '+this.state.doingAsync)
        })
      }
    }
    return recipes
  }

  /* 
   *  Get URLs from all pages
   */
  async processPages(pages) {
    let allURLs = []
    let intValuePages = parseInt(this.state.valuePages)
    let pagesAmount = intValuePages + 1
    pagesAmount = parseInt(pagesAmount)

    //for (let i = 1; i < pages; i++) {
    for (let i = 1; i < pagesAmount; i++) {
      this.setState({doingAsync: true})
    	
      if (this.mounted) {
        this.setState({checkerE: 'Extracting page ' + i + '...'})
      }
      await this.fetchPage(i).then((response) => {

        // If page returned data, add it to recipes URLs array
        if (response.data) allURLs.push.apply(allURLs, response.data)

        // If page returned error, log it in console
        else console.log(response.error)
      })

      if ((i+1) === pagesAmount) {
        this.setState({doingAsync: false}, function() {
          console.log('Loop ended, now it is: '+this.state.doingAsync)
        })
      }
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
              elText = decodeHtml(elText)

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
            recipe[elKey] = elText
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
      if (this.mounted) {
        this.setState({
          error: true
        })
      }
    }
    return recipesGood
  }

  /* 
   *  Add, update or delete recipe in database
   */
  checkBeforeSave(recipe, dbRecipesIDs) {
    return new Promise((resolve, refuse) => {
      let recipeExists = false
      let existingID = ''

      for (let recipeID of dbRecipesIDs) {
        if (recipe.recipe_id === recipeID) {
          recipeExists = true
          existingID = recipeID
        } 
      }

      if (recipeExists) {
        db.table('recipes').get({recipe_id: existingID})
        .then((response) => {
          let recordId = response.id
          db.table('recipes').update(recordId, recipe)
          .then(() => resolve({new: false}))
          .catch((error) => refuse(error))
        })
        .catch((error) => refuse(error))
      } else {
        db.table('recipes').add(recipe)
        .then(() => resolve({new: true}))
        .catch((error) => refuse(error))
      }
    })
  }

  /* 
   *  Get recipes from database to check
   */
  startSaving() {

    return new Promise((resolve, refuse) => {
      db.table('recipes').toArray()
      .then((recipes) => {
        if (this.mounted && !this.state.resetting) {
          this.setState({
            recipesInDb: recipes,
            startedL: true,
            checkerL: 'Loading records to database...'
          }, () => {
            resolve()
          })
        } else {
          refuse()
        }
      }).catch((error) => refuse(error))
    })
  }

  /* 
   *  Save recipes to database
   */
  async processSaving() {

    let newRecipes = this.state.recipes
    let dbRecipes = this.state.recipesInDb
    let dbRecipesIDs = []
    let newRecipeCount = 0
    let updatedRecipeCount = 0

    for (let recipe of dbRecipes) {
      dbRecipesIDs.push(recipe.recipe_id)
    }    

    for (let recipe of newRecipes) {
      if (this.mounted) {
        // eslint-disable-next-line
        await this.checkBeforeSave(recipe, dbRecipesIDs).then((response) => {
          if (response.new) {
            newRecipeCount++
          } else {

            updatedRecipeCount++
          }
        })
      }
    }

    return {newRecipes: newRecipeCount, updatedRecipes: updatedRecipeCount}

    // Na koniec:
    // Check if the number of recipes is correct - updated + added
    // If there's more in the database, find those that don't have their ID
    // and delete them. 
  }

  /* 
   *  Steps ETL process
   */
  stepsProcess() {

    if (this.mounted) {
      this.setState({
        inStepsProcess: true
      })
    }
  }

  /* 
   *  Full ETL process
   */
  stepE() {

    if (this.mounted) {
      this.setState({
        startedE: true,
        checkerE: 'Extracting in progress...'
      })
    }

    this.getPages()
    .then((response) => this.processPages(response))
    .then((response) => this.processRecipes(response))
    .then((response) => this.finishPhaseE(response))
    .then(() => {
      if (this.mounted) {
        this.setState({
          extractedData: this.state.recipes
        })
      }
    })
    .catch((error) => {
      console.log(error)
    })
  }

  stepT() {

    let extractedData = this.state.extractedData
    
    this.processDetailsSteps(extractedData)
    .then((response) => this.finishPhaseT(response))
    .then(() => {
      if (this.mounted) {
        this.setState({
          transformedData: this.state.recipes
        })
      }
    })
    .catch((error) => {
      console.log(error)
    })
  }

  stepL() {
    let transformedData = this.state.transformedData
    this.startSaving(transformedData)
    .then((response) => this.processSaving(response))
    .then((response) => this.finishPhaseL(response))
    .catch((error) => {
      console.log(error)
    })
  }

  /* 
   *  Get data from recipes HTML into array of arrays
   */
  processDetailsSteps(extracted) {

    return new Promise((resolve, refuse) => {
      if (this.mounted) {
        this.setState({
          startedT: true,
          checkerT: 'Transformation in progress...'
        })
      }

      let recipes = extracted
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
        if (this.mounted) {
          this.setState({
            error: true
          })
        }
      }

      resolve(recipesGood)
    })
  }


  /* 
   *  RENDER
   */
  render() {
    return (
	    <div className="page page__etl">
      	<PageTitle title="Etl"/>
      	<div className="page-content">

          { (!this.state.inFullProcess && !this.state.inStepsProcess) ? 
            <div className="etl__buttons">

            <div className="etl__process_phase etl__process_steps">
              <div className="etl__process_phase-title">
                <span>Settings</span> 
              </div>

              <div className="etl__values">
              	<label>
                  <div className="etl__checkbox">
                    <input type="checkbox" checked={this.state.withProxy} onChange={this.handleProxyChange} />
                    <div className="etl__checkbox-fake"></div>
                  </div>
                  <span>Proxy?</span>
                </label>
                <label>
                  <span className="etl__settings-info">You can disable proxy if you have CORS Chrome Extension installed to avoid proxy timeout issues.</span>
                </label>
                <label>
                  <input type="text" value={this.state.valuePages} onChange={this.handlePagesChange} />
                  <span>Pages</span>
                </label>
                <label>
                  <input type="text" value={this.state.valueRecipes} onChange={this.handleRecipesChange} />
                  <span>Recipes (1-28)</span>
                </label>
              </div>
            </div>

              <div className="etl__buttons__wrap">
          		  <button onClick={this.fullProcess} className="btn">Full ETL Process</button>
              </div>
              <div className="etl__buttons__wrap">
          		  <button onClick={this.stepsProcess} className="btn">ETL Step by step</button>
              </div>
            </div>
          : 
            <div className="etl__process">

              <div className="menu__button-wrap">
                <button onClick={this.resetComponent} className="btn etl__process_goback">Stop ETL and go back</button>
              </div>

              {this.state.inStepsProcess ? 
                <div className="etl__process_phase etl__process_steps">
                  <div className="etl__process_phase-title">
                    <span>Choose available step</span> 
                  </div>
                  <div className="menu__confirm-buttons">

                    <button 
                    {...(this.state.extractedData ? {disabled:true} : {})}
                    onClick={this.stepE} className="btn">E</button>

                    <button 
                    {...((this.state.extractedData && !this.state.transformedData) ? {} : {disabled:true})}
                    onClick={this.stepT} className="btn">T</button>

                    <button 
                    {...((this.state.transformedData && !this.state.finishedL) ? {} :  {disabled:true})}
                    onClick={this.stepL} className="btn">L</button>

                  </div>
                </div>
              : '' }

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
                          Extracting has finished.
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
                          Transformation has finished.
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
                          Loading has finished.
                        </div> 
                        <div className="etl__process_finished-details">

                          Added <strong>{this.state.newRecipes}</strong> new 
                          {this.state.newRecipes === 1 ? ' recipe.' : ' recipes.' }
                          <br/> 
                          Updated <strong>{this.state.updatedRecipes}</strong> 
                          {this.state.updatedRecipes === 1 ? ' recipe.' : ' recipes.' }

                          <div className="menu__confirm-buttons">
                            <NavLink className="btn" to="/data">See the Data</NavLink>
                          </div>

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
