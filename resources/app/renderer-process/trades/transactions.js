const tableContainer = document.getElementById("tx-table-container")

function getTXTableHTML() {
    //Switch out placeholder with strings to be output to screen
    const content =`
        <table id="tx-table" class="output-table">
            
            <thead>
            <tr>
                <th>Link</th>
                <th>Time Stamp</th>
                <th>Input Token</th>
                <th>Traded (out) Token</th>
                <th>Price</th>
                <th>Type</th>
                <th>Amount In</th>
                <th>Amount Out</th>
                <th>Success</th>
            </tr>
            </thead>
            <tbody>
                
            </tbody>
            
        </table>
        <br>
    `;

    tableContainer.innerHTML += content;
}

module.exports = getTXTableHTML();