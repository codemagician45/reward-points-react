import React, { useState, useEffect } from "react";
import { useTable } from 'react-table';
import './App.css';

const calculateRewards = (sourceData) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const pointsPerTransaction = sourceData.map(transaction => {
        let points = 0;
        let bigPoint = transaction.usd - 100;

        if (bigPoint > 0) {
            points += (bigPoint * 2);
        }
        if (transaction.usd > 50) {
            points += 50;
        }
        const month = new Date(transaction.date).getMonth();
        return {...transaction, points, month };
    });

    let pointsPerCustomer = {}

    pointsPerTransaction.forEach(pT => {
        let { id, name, month, points } = pT;
        if (!pointsPerCustomer[id]) {
            pointsPerCustomer[id] = []
        }
        if (!pointsPerCustomer[id][month]) {
            pointsPerCustomer[id][month] = {
                id,
                name,
                monthNumber: month,
                month: months[month],
                numTransactions: 1,
                points
            }
        } else {
            pointsPerCustomer[id][month].points += points;
            pointsPerCustomer[id][month].numTransactions++;
        }
    })

    let total = [];
    for (var custKey in pointsPerCustomer) {
        pointsPerCustomer[custKey].forEach(cRow => {
            total.push(cRow);
        });
    }

    return {
        summaryByCustomer: total,
        pointsPerCustomer,
        pointsPerTransaction,
    };
}

function Table({ columns, data, getIndividualTransactions }) {

    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
    } = useTable({
      columns,
      data,
    })
    return (
        <table {...getTableProps()}>
         <thead>
         {headerGroups.map(headerGroup => (
             <tr {...headerGroup.getHeaderGroupProps()}>
               {headerGroup.headers.map(column => (
                   <th
                       {...column.getHeaderProps()}
                       style={{
                         borderBottom: 'solid 3px red',
                         color: 'black',
                       }}
                   >
                     {column.render('Header')}
                   </th>
               ))}
             </tr>
         ))}
         </thead>
         <tbody {...getTableBodyProps()}>
         {rows.map(row => {
           prepareRow(row)
           console.log(getIndividualTransactions(row))
           return (
               <tr {...row.getRowProps()}>
                 {row.cells.map(cell => {
                   if(cell.column.id == 'detailed_data'){
                       return (
                           <td
                                {...cell.getCellProps()}
                                style={{
                                    padding: '10px',
                                    border: 'solid 1px gray',
                                }}
                           >
                            {getIndividualTransactions(row).map(tran => {
                               return <ul>
                                   <li><strong>Date:</strong> {tran.date} -<strong>Amount</strong> ${tran.usd} - <strong>Points:</strong> {tran.points}</li>
                               </ul>
                            })}
                           </td>
                       )
                   }
                   return (
                       <td
                           {...cell.getCellProps()}
                           style={{
                             padding: '10px',
                             border: 'solid 1px gray',
                           }}
                       >
                         {cell.render('Cell')}
                       </td>
                   )
                 })}
               </tr>
           )
         })}
         </tbody>
       </table>
      )
  }

function App() {
    const [transactionData, setTransactionData] = useState(null);
    useEffect(() => {
        fetch('./data.json')
            .then(res => res.json())
            .then(data => {
                const pointsData = calculateRewards(data);
                setTransactionData(pointsData)
            })
    }, [])

    const getIndividualTransactions = (row) => {
        let byCustMonth = transactionData.pointsPerTransaction.filter((tRow) => {
            return row.original.id === tRow.id && row.original.monthNumber === tRow.month;
        });
        return byCustMonth;
    }

    const columns = React.useMemo(
        () => [{
                Header: 'Customer',
                accessor: 'name',
            },
            {
                Header: 'Month',
                accessor: 'month',
            },
            {
                Header: "Number of Transactions",
                accessor: 'numTransactions'
            },
            {
                Header: 'Reward Points',
                accessor: 'points'
            },
            {
                Header: 'Detailed Data list',
                accessor: 'detailed_data'
            }
        ], []
    )
    
    if(!transactionData){
        return <div>...loading</div>
    } else {

        return (
            <Table columns={columns} data={transactionData.summaryByCustomer} getIndividualTransactions={getIndividualTransactions}/>
        )
    }
    
}

export default App;