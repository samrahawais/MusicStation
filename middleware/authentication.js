const jwt = require('jsonwebtoken')
const express = require("express")
const secret = "superstar"

exports.authentication = function (request, response, next) {
    const authorizationHeader = request.header("authorization") // "Bearer XXX"
    if (authorizationHeader) {
        console.log("authorication header contains:" + authorizationHeader)
        const accessToken = authorizationHeader.substring("Bearer ".length)
        //const accessToken = authorizationHeader && authorizationHeader.split(' ')[1]// substring("Bearer ".length) // "XXX"
        if (accessToken == null) {
            return response.status(401).send("access token is null")
        }
        console.log("Access Token : " + accessToken)

        // const payload=
        jwt.verify(accessToken, secret, function (error)//, payload)
        {
            if (error)
                response.status(401).end()
            else {

                console.log("yes")
                next()

            }
        })
    } else {
        response.status(401).send("You are not authorized for this").end()
    }
}

