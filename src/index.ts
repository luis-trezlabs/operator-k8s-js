import PrintOperator from './PrintOperator'

//self invoked async function
(async () => {
    const operator = new PrintOperator()
    //This is just await for the init() function implemented on the instance MyOPerator.
    await operator.start()

    const exit = (reason: string) => {
        //Aborting each watch request.
        operator.stop()
        // Terminating the nodejs process with 'success' code 0
        console.log(reason)
        process.exit(0)
    }

    //calling exit when the terminal is closed.
    process.on('SIGTERM', () => exit('SIGTERM')).on('SIGINT', () => exit('SIGINT'))
})();

