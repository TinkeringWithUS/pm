param(
    [Parameter(Position=0, Mandatory=$false)]
    [ValidateSet("test", "debug", "test-race")]
    [string]$Command,

    [Parameter(Position=1, ValueFromRemainingArguments=$true)]
    $Rest
)


function test {
    param (
        [switch]$headed = $false
    )
    # TODO: spawn a new process that runs the frontend and backend
    # before starting testing
    if ($headed) {
        Write-Host "Running tests headed"
        python3 -m pytest .\tests\  --headed
    } else {
        Write-Host "Running tests without browser"
        python3 -m pytest .\tests\ 
    }

    # python3 -m pytest .\tests\ 
}


function debug {
    param ()
    python3 -m pytest .\tests\  --headed --slowmo 2000
}

function test-race  {
    param ()
    $numRuns = 10 

    # TODO: use concurrency to speed up testing

    for ($i = 0; $i -lt $numRuns; $i++) {
        $debugOutput = ( test ) -join "`n"
        $hasFailure = $debugOutput | Select-String -Pattern 'FAILED' -SimpleMatch -Quiet

        if($hasFailure) {
            Write-Error "FAILURE RACE CONDITON Ith Run: $($i)"
            break
        }
    }
}

# TODO: figure out how to pass arguments to test
switch ($Command) {
    "test" { 
        Write-Host $Rest
        test($Rest)
    }
    "debug" {
        debug
    }
    "test-race" {
        test-race
    }
    Default {
        Write-Host "Command not recognized"
        Write-Host $Command
    }
}
