const callBtn = document.querySelector('.btn-call-n-listen')
const mainElement = document.querySelector('main')
const fetchedInfoDiv = document.querySelector('.fetched-info')
const tableBody = document.querySelector('tbody')


function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

const getData = async (url) => {
  // Return fetched data object by url 
  return await fetch(url).then(response => response.json())
}

const getObjectDataDeeper = (obj) => {
  // Fetches info by urls in values of obj in 1 level lower
  const newObj = {}

  Object.keys(obj).forEach(async key => {  
    if (typeof obj[key] === 'object') {
      const arr = []
      obj[key].forEach( async link => {
        const data = await getData(link)
        arr.push(data)
      })
      newObj[key] = arr
    } else if (validURL(obj[key]) && key !== 'url') {
      newObj[key] = await getData(obj[key])
    } else {
      newObj[key] = obj[key]
    }
  })

  return newObj
}

const formatTime = (dateTimeString) => {
  // Returns russian locale formatted string from datetime string
  const options = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }
  const dateObj = new Date( Date.parse(dateTimeString) );
  return new Intl.DateTimeFormat('ru-RU', options).format(dateObj)
}

const appendTableRowsHTMLFromObj = (tableBody, obj) => {
  Object.keys(obj).forEach(key => {
    const newRow = document.createElement('tr')
    
    let valueString = 'ничего'

    if (typeof obj[key] === 'string') {
      valueString = (key === 'created' || key === 'edited')
          ? formatTime(newObj[key]) 
          : newObj[key]
    } else if (obj[key].length) {
      const stringValue = JSON.stringify(obj[key].map(obj => {
        return obj.name ? obj.name : obj.title 
      }))
      valueString = stringValue.slice(1, stringValue.length - 1)
    }
    
    newRow.innerHTML = `<td>${ key }</td> <td>${ valueString }</td>`  
    
    tableBody.appendChild(newRow)
  })
}


const newObj = {}

const loaderHTML = `
  <div class="loader">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
  <div class="loader-text">Loading</div>
`

const main = () => {
  fetch('https://swapi.dev/api/people/1/')
  .then(response => response.json())
  .then(dataObj => {
    Object.assign(newObj, getObjectDataDeeper(dataObj))
  })
  .then(() => {
    // TODO: remove setTimeout
    const loader = document.createElement('div')
    loader.className = 'loader-wrapper'
    loader.innerHTML = loaderHTML
    fetchedInfoDiv.parentNode.appendChild(loader)
    loader.style.height = '400px'
    setTimeout(() => {
      fetchedInfoDiv.parentNode.removeChild(loader)
      appendTableRowsHTMLFromObj(tableBody, newObj)
      fetchedInfoDiv.style.display = 'block'
      callBtn.onclick = null
    }, 2000)
  })

}

callBtn.addEventListener('click', main, {once : true})
