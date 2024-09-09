const http = require('http')
const express = require('express')
const app = express()
const server = http.createServer(app)
const cors = require('cors')
const PORT = process.env.SOCKET_PORT || 3000

app.use(cors({
    origin: '*'
}))

app.post('/api/submit/tx', express.json(), (req: any, res: any) => {
    try {
        checkMint(req.body)
        res.sendStatus(200)
    }
    catch (error) {
        console.error('Error:', error)
        res.status(500).send('Internal Server Error')
    }
})

function checkMint(req: any){
    console.log(req);
    //check mint
    //check if already minted
    //check fee to operator address
    //sign and build with kuber
    // submit tx 
}

server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})