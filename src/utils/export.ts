// const exportDatasets = [
//     {
//         'feature.name': 'record.value',
//         'feature1.name': 'record1.value',
//         'feature2.name': 'record2.value',
//         'feature3.name': 'record3.value',
//     },
//     {
//         'feature.name': 'record4.value',
//         'feature1.name': 'record5.value',
//         'feature2.name': 'record6.value',
//         'feature3.name': 'record7.value',
//     }
// ]

// let body = {}
// let params = {}

// // airtable
// body['records'] = {{exportDatasets}}.map(dataset => {
//     return { fields: dataset }
// })

// // notion
// body['properties'] = exportDatasets.map(dataset => {
//     return {
//         'feature': {
// 			"title": [
// 				{
// 					"text": {
// 						"content": dataset["feature1.name"]
// 					}
// 				}
// 			]
// 		},
// 		'feature1': {
// 			"rich_text": [
// 				{
// 					"text": {
// 						"content": dataset["feature1.name"]
// 					}
// 				}
// 			]
// 		},
//     }
// })

// // trello
// params['name'] = exportDatasets[0]['feature'];
// params['desc'] = exportDatasets[0]['feature1'];
