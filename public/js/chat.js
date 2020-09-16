const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

//Function to setup autoscrolling
const autoscroll = () => {
	//Get new message element
	const $newMessage = $messages.lastElementChild

	//Get height of the new message
	const newMessageStyles = getComputedStyle($newMessage)
	const newMesssageMargin = parseInt(newMessageStyles.marginBottom)//Extracts marginBottom value from styles then converts it to a number
	const newMessageHeight = $newMessage.offsetHeight + newMesssageMargin //Add margin to the height of the message

	//Get the Visible height
	const visibleHeight = $messages.offsetHeight

	//Get height of messages container
	const containerHeight = $messages.scrollHeight

	//How far the user has scrolled
	const scrollOffset = $messages.scrollTop + visibleHeight//scrollTop retruns how far the user has scrolled from the top of the page

	//Checks if the user is at the bottom of the page
	if(containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight//Autoscrolls the users page to the bottom of the page
	}
}

socket.on('message', (message) => {
	console.log(message)
	const html = Mustache.render(messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format('h:m a')
	})
	$messages.insertAdjacentHTML('beforeend', html)
	autoscroll()//Call to autoscrolling function
})

socket.on('locationMessage', (message) => {
	console.log(message)
	const html = Mustache.render(locationTemplate, {
		username: message.username,
		url: message.url,
		createdAt: moment(message.createdAt).format('h:m a')
	})
	$messages.insertAdjacentHTML('beforeend', html)
	autoscroll()//Call to autoscrolling function
})

socket.on('roomData', ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users
	})
	document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
	e.preventDefault()

	//disables the form after submission
	$messageFormButton.setAttribute('disabled', 'disabled')

	const message = e.target.elements.message.value
	socket.emit('sendMessage', message, (error) => {
		//re-enable the form
		$messageFormButton.removeAttribute('disabled')
		//clear input field and focus cursor 
		$messageFormInput.value = ''
		$messageFormInput.focus()

		if(error){
			return console.log(error)
		}

		console.log('The message was delivered')
	})
})

$locationButton.addEventListener('click', () => {
	if(!navigator.geolocation){
		return alert('Geolocation not supported by this browser!')
	}

	$locationButton.setAttribute('disabled', 'disabled')

	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit('sendLocation', {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		}, () => {
			console.log('Location shared!')
			$locationButton.removeAttribute('disabled')
		})
	})
})

socket.emit('join', { username, room }, (error) => {
	if(error){
		alert(error)
		location.href = '/'
	}
})