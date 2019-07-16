// Required for Node
const fetch = require('isomorphic-fetch')


// Action types
const UPDATE_USER = 'UPDATE_USER'
const UPDATE_CONTACT = 'UPDATE_CONTACT'
const LOG_IN_SUCCESS = 'LOG_IN_SUCCESS'

class Store {
    constructor(reducer, initialState) {
        this.reducer = reducer
        this.state = initialState
    }
    getState() {
        return this.state
    }
    // Lose this binding. Form own class. Cannot use in Node
    // dispatch = (action) {

    // for node  below
    dispatch(action) {

        if (typeof action === 'function') {

            // below use with seperate class
            // action(this.dispatch)

            // this use for Node
            action(this.dispatch.bind(this))
        } else {
            console.log('received an action:', action.type)
            this.state = this.reducer(this.state, action)
        }
    }
}
const DEFAULT_STATE = { user: {}, contacts: [] }

const merge = (prev, next) => Object.assign({}, prev, next)

const contactReducer = (state, action) => {
    if (action.type === UPDATE_CONTACT) {
        return [...state, action.payload]
    }
    return state
}

const userReducer = (state, action) => {
    switch (action.type) {
        case UPDATE_USER:
            return merge(state, action.payload)
        case UPDATE_CONTACT:
            return merge(state, { prevContact: action.payload })
        case LOG_IN_SUCCESS:
            return merge(state, { token: 'fakeToken' })
        default:
            return state
    }
}


const reducer = (state, action) => ({
    user: userReducer(state.user, action),
    contacts: contactReducer(state.contacts, action)
})

// Login function from contact list app. Works with authServer
const login = async (username, password) => {

    // fetch does not exist in Node. NPM Install isomorphic-fetch
    const response = await fetch('http://localhost:8000', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })

    if (response.ok) {
        return true
    }

    const errMessage = await response.text()
    throw new Error(errMessage)
}

// Action creators
const updateUser = update => ({
    type: UPDATE_USER,
    payload: update
})
const addContact = newContact => ({
    type: UPDATE_CONTACT,
    payload: newContact
})

// Async action creator
const logInUser = (username, password) => dispatch => {
    dispatch({ type: 'LOG_IN_SENT' })
    login(username, password)
        .then(() => {
            dispatch({ type: LOG_IN_SUCCESS })
        })
        .catch(err => {
            dispatch({ type: 'LOG_IN_REJECTED' })
        })
}
logInUser()

const store = new Store(reducer, DEFAULT_STATE)

store.dispatch(logInUser('username', 'password'))
// store.dispatch(updateUser({ foo: 'foo' }))
// store.dispatch(updateUser({ bar: 'bar' }))
// store.dispatch(updateUser({ foo: 'baz' }))

// store.dispatch(addContact({ name: 'Tammy', number: '1231231234' }))
// store.dispatch(addContact({ name: 'Jenny', number: '5435435432' }))


console.log(store.getState())
