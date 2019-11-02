const socket = io()

// DOM Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationBtn = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const topBarTemplate = document.querySelector('#topBar-template').innerHTML 

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


socket.on('message', (message) => {
    // console.log(message)

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('kk:mm:ss')
    })

    $messages.insertAdjacentHTML('beforeend', html)

}) 


socket.on('locationMessage', (LocationMsg) => {

    const html = Mustache.render(locationTemplate, {
        username: LocationMsg.username,
        url: LocationMsg.url,
        createdAt: moment(LocationMsg.createdAt).format('kk:mm:ss')
    })

    $messages.insertAdjacentHTML('beforeend', html)

})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(topBarTemplate, {
        room,
        users
    })

    document.querySelector('#topBar').innerHTML = html

})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // disable 
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {

        // enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()


        if(error){
            return console.log(error)
        }

        // console.log('The message was delivered!')

    })

})


// Location

$sendLocationBtn.addEventListener('click', () => {

    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocationBtn.setAttribute('disabled', 'disabled')
    
    navigator.geolocation.getCurrentPosition((position) => {
        
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude 
        }, () => {
            // console.log('Location shared!')
            $sendLocationBtn.removeAttribute('disabled')
        })

    })

    
})

// 
socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})