const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const { MongoClient } = require('mongodb')

const app = express()
const client = new MongoClient("mongodb+srv://michael:RL5WOCgrut8cAtII@cluster0.pmbs7bv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

app.use(cors())
app.use(express.json())
let db

const randomId = (length) => {
  try {
    let final = ""
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    let counter = 0
    while (counter < length) {
      final += characters.charAt(Math.floor(Math.random() * charactersLength))
      counter += 1
    }
    return { code: 200, result: final }
  } catch(error) {
    return { code: 500, error: error }
  }
}

const validateEmail = (email) => {
  try {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    return { code: 200, result: email.toLowerCase().match(emailRegex) }
  } catch(error) {
    return { code: 500, error: error }
  }
}

const validateNumber = (string) => {
  try {
    return { code: 200, result: !isNaN(string) && !isNaN(parseFloat(string)) }
  } catch (error) {
    return { code: 500, error: error }
  }
}

const dbCreate = async (collection, data) => {
  try {
    const result = await db.collection(collection).insertOne(data)
    return { code: 200 }
  } catch(error) {
    return { code: 500, error: error }
  }
}

const dbGet = async (collection, query) => {
  try {
    const result = await db.collection(collection).findOne(query)
    return { code: 200, result: result }
  } catch(error) {
    return { code: 500, error: error }
  }
}

const dbUpdateSet = async (collection, query, data) => {
  try {
    const result = await db.collection(collection).updateOne(query, { $set: data })
    return { code: 200, result: result }
  } catch(error) {
    return { code: 500, error: error }
  }
}

const dbUpdateReplace = async (collection, query, data, unset) => {
  try {
    const result = await db.collection(collection).updateOne(query, { $set: data, $unset: unset })
    return { code: 200, result: result }
  } catch(error) {
    return { code: 500, error: error }
  }
}

const dbUpdateInc = async (collection, query, data) => {
  try {
    const result = await db.collection(collection).updateOne(query, { $inc: data })
    return { code: 200, result: result }
  } catch(error) {
    return { code: 500, error: error }
  }
}

app.post("/login", async (req, res) => {
  try {
    let result = await dbGet("users", { email: req.body.email.toLowerCase() })
    result = result.result
    if(result) {
      bcrypt.compare(req.body.password, result.password, (error, pass) => {
        if(error) {
          res.json({ code: 500, error: error })
        } else {
          if (pass) {
            res.json({ code: 200, result: result.private })
          } else {
            res.json({ code: 400, error: [2, "Invalid password."] })
          }
        }
      })
    } else {
      res.json({ code: 400, error: [1, "Unknown email."] })
    }
  } catch(error) {
    res.json( {code: 500, error: error} )
  } 
})

app.post("/signup", async (req, res) => {
	try {
    const first = req.body.first
    const last = req.body.last
    const email = req.body.email.toLowerCase()
    const password = req.body.password
    const private = randomId(15)
    let errors = []

    if(first == "" || first == null) {
      errors.push([1, "First name required."])
    }

    if(last == "" || last == null) {
      errors.push([2, "Last name required."])
    }

    if(email == "" || email == null) {
      errors.push([3, "Email required."])
    } else {
      const testEmail = validateEmail(email)
      if(testEmail.result == null) {
        errors.push([4, "Invalid email."])
      }

      const getEmail = await dbGet("users", {"email": email})
      if(getEmail.result != null) {
        errors.push([5, "Email taken."])
      }
    }

    if(password == "" || password == null) {
      errors.push([6, "Password required."])

      if(password.split("").length < 8) {
        errors.push([7, "Passwords must be at least 8 characters long."])
      }
    }

    if(errors.length > 0) {
      res.json({ code: 400, error: errors })
    } else {
      bcrypt.genSalt(10, async (error, salt) => {
        bcrypt.hash(password, salt, async function(error, hash) {
          const result = await dbCreate("users", {
            first: first,
            last: last,
            email: email,
            private: private.result,
            available: [],
            password: hash
          })

          if(result.code == 200) {
            result.private = private.result
            res.json(result)
          } else {
            res.json(result)
          }
        })
      })
    }
  } catch(error) {
    res.json({ code: 500, error: error })
  }
})

app.post("/get", async (req, res) => {
  // Takes in auth key and returns users data. Universal preferences, email, first, last, list of requests, and users packages.
  // Requests include id, type, status, description, attachments, priority, title, developer, estimated and real completion date, start date, final product, and any developer messages.
  // When developer account calls this route all of the requests for them are loaded as well as information for the dashboard like stats.
})

app.post("/create", async (req, res) => {
  try {
    const type = req.body.type
    const title = req.body.title
    const description = req.body.description
    const attachments = req.body.attachments
    const priority = req.body.priority
    const private = req.body.private
    const id = randomId(15)
    let errors = []

    if(private == "" || private == null) {
      errors.push([1, "Private required."])
    }

    const user = await dbGet("users", { private: private })
    if(!user.result) {
      errors.push([11, "Unknown private."])
    }

    if(type != "design" && type != "backend" && type != "frontend" && type != "ai") {
      errors.push([2, "Invalid role."])
    } else {
      if(!user.result.available.includes(type)) {
        errors.push([3, "Type is not available for user."])
      }
    }

    if(title == "" || title == null) {
      errors.push([4, "Title required."])
    }

    if(description == "" || description == null) {
      errors.push([5, "Description required."])
    }

    if(priority == null) {
      errors.push([6, "Priority required."])
    } else {
      if(!validateNumber(priority).result) {
        errors.push([7, "Priority must be a number."])
      } else {
        if(typeof priority != "number") {
          priority = parseInt(priority.toString())
        }

        if(priority < 1 || priority > 3) {
          errors.push([8, "Priority must be 1, 2, or 3."])
        }
      }
    }

    if(attachments == null) {
      errors.push([9, "Attachments required."])
    } else {
      if(!Array.isArray(attachments)) {
        errors.push([10, "Attachments variable must be an array."])
      }
    }

    if(errors.length > 0) {
      res.json({ code: 400, error: errors })
    } else {
      const result = await dbCreate("requests", {
        type: type,
        title: title,
        description: description,
        attachments: attachments,
        priority: priority,
        id: id.result
      })

      let updatedRequests = []
      let currentAvailable = user.result.available
      let newAvailable = currentAvailable.filter(item => item != type)
      if(user.result.requests) {
        updatedRequests = user.result.requests
      }
      updatedRequests.push(id.result)
      await dbUpdateSet("users", { private: private }, { requests: updatedRequests, available: newAvailable })

      if(result.code == 200) {
        result.id = id.result
        res.json(result)
      } else {
        res.json(result)
      }
  }
  } catch(error) {
    console.error(error)
    res.json({ code: 500, error: error })
  }
})

app.post("/update", async (req, res) => {
  // User can only update information when route is in review. Also the ability to cancel. 
  // Developer dashboard will use this route to deal with the progress.
})

app.post("/settings", async (req, res) => {
  // Change email, password, first, last, and universal preferences.
})

/* Payments Route for buying different packages. After the first package is bought the next ones are all 80% off. Handles payments and then adds to the role array. */

app.listen(3000, async () => {
  try {
    await client.connect()
    db = client.db("main")
    console.log(`Server running on http://localhost:3000`)
  } catch (error) {
    console.error("Could not connect to db:", error)
    process.exit(1)
  }
})
