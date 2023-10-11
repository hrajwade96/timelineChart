document.getElementById('upload').addEventListener('change', handleFileUpload);

function handleFileUpload(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        var contents = e.target.result;
        try {
            var data = JSON.parse(contents);
            createTimeline(data);
        } catch (e) {
            alert('Invalid JSON file');
        }
    };
    reader.readAsText(file);
}

document.addEventListener('DOMContentLoaded', () => {
    window.loadData = () => { // Defined globally to be accessed by inline HTML onclick
        try {
            const jsonData = document.getElementById('jsonData').value;
            const itemsData = JSON.parse(jsonData);
            createTimeline(itemsData);
        } catch (e) {
            alert('Invalid JSON data');
            console.error(e);
        }
    };
});

function createTimeline(itemsData) {
    var container = document.getElementById("visualization");
    var items = new vis.DataSet(itemsData);

    var options = {
        format: {
            minorLabels: {
                millisecond: 's.SSS',
            }
        },
        zoomMin: 1000,  // Minimum zoom level to prevent zooming out too much
        zoomMax: 10000000,
        showCurrentTime: false,
        align: 'left',
        orientation: { axis: 'both', item: 'top' },
        height: 600,
        margin: {
            axis: 100
        }
    };

    var timeline = new vis.Timeline(container, items, options);

    timeline.on('rangechange', function () {
        var range = timeline.getWindow();
        itemsData.forEach(function (item) {
            var start = new Date(item.start).getTime();
            var end = new Date(item.end).getTime();
            if (start >= range.start && end <= range.end) {
                var element = timeline.itemSet.items[item.id].dom.box;
                element.setAttribute("title", item.content + " (" + formatDateTimeWithMilliseconds(new Date(item.start)).toLocaleString() + " - " + formatDateTimeWithMilliseconds(new Date(item.end)).toLocaleString() + ")");
            }
        });
    });

    function formatDateTimeWithMilliseconds(date) {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };

        let formattedDate = date.toLocaleString('en-US', options);
        let milliseconds = date.getMilliseconds();

        // pad milliseconds with zeros in front if less than 100 or 10
        milliseconds = milliseconds.toString().padStart(3, '0');

        return `${formattedDate}.${milliseconds}`;
    }
    
}
