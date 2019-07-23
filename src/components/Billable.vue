<template>
  <div>
    <div class="content">
      <form enctype="multipart/form-data" class="forn-inline">
          <label>Please use the button below to upload a timesheet.</label>
          <input type="text" class="form-control mb-2 mr-sm-2" id="text" placeholder="No upload yet" v-model="file_name">
          <button type="submit" class="btn btn-primary mb-2" @click.prevent="upload">{{ button_text }}</button>
          <input type="file" @change="onFileChange" style="display: none" id="uploader">
      </form>
    </div>

    <!-- <b-table :data="rowData" :columns="columns"></b-table> -->
    <div class="container" v-for="(project, index) in projects" :key="index">
      <h2>{{ project }}</h2>
      <table class="table table-condensed">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Number of Hours</th>
            <th>Unit Price</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in get_bills(project)" :key="index">
            <td>{{ row.employee_id }}</td>
            <td>{{ time_difference(row.start_time, row.end_time) }}</td>
            <td>{{ row.rate_per_hour }}</td>
            <td>{{ get_cost(row.rate_per_hour, row.start_time, row.end_time) }}</td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td style="text-align: right;"><b>Total:</b></td>
            <td style="text-align: left;">{{ get_total(project) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

</template>
<script>
import * as d3 from "d3v4";
export default {
  name: 'Billable',
  data() {
    return{
      fileUrl: '',
      file_name:'',
      rowData: [],
      projects: [],
      button_text: 'Choose',
      total: 0
    }
  },
  created(){
        localStorage.setItem("total", 0);
      },

        methods: {
            onFileChange: async function(e) {
                if(!this.hasExtension('uploader',['.csv'])){
                  this.$notify({
                    group: 'foo',
                    type:'error',
                    title: 'Invalid file type',
                    text: 'Only csv files are allowed!'
                  });
                  return;
                }
                var files = e.target.files || e.dataTransfer.files;
                if (!files.length)
                    return;
                await this.createInput(files[0]);
            },
            createInput: async function(file) {
                var reader = new FileReader();
                // var vm = this;
                await reader.readAsDataURL(file);
                reader.onload = () => {
                  this.fileUrl = reader.result;
                  d3.csv(this.fileUrl, (error, data) => {
                  let allowed_columns = [
                                      "Billable Rate (per hour)",
                                      "Date",
                                      "Employee ID",
                                      "End Time",
                                      "Project",
                                      "Start Time"
                                     ];
                  if(data.columns.sort().toString() !== allowed_columns.sort().toString()){
                    this.$notify({
                      group: 'foo',
                      type:'error',
                      title: 'Invalid content',
                      text: 'This timesheet doesn\'t follow the accepted structure.'
                    });
                    return;
                  }
                  const replacements = {
                  'Employee ID': 'employee_id', 
                  'Billable Rate (per hour)': 'rate_per_hour',
                  'Project': 'project',
                  'Date': 'date',
                  'Start Time': 'start_time',
                  'End Time': 'end_time'};
                  let projects = [];
                    let newData = data.map(row =>{
                      projects.push(row.Project);
                    let replacedItems = Object.keys(row).map((key) => {
                      const newKey = replacements[key] || key;
                      return { [newKey] : row[key] };
                    });
                    const newRow = Object.assign({}, ...replacedItems);
                    return newRow;
                  });
                  this.projects = new Set(projects);
                  this.rowData = newData;
                  this.file_name = file.name;
                  this.button_text = 'Choose another'
                  });
                }
            },

            time_difference: (a,b) =>{
              let time1 = a.split(':');
              let time2 = b.split(':');
              let date1 = new Date(0, 0, 0, time1[0], time1[1]);
            let date2 = new Date(0, 0, 0, time2[0], time2[1]);
            var difference = new Date(date2 - date1);
            return difference.getUTCHours();
            },
            get_cost: function(rate, start_time, end_time){
              var hours = this.time_difference(start_time, end_time);
              var cost = rate * hours;
              var current_total = parseInt(localStorage.getItem('total'));
              current_total += cost;
              localStorage.setItem('total', current_total);
              return cost;
            },
            get_total: function(){
              let total = localStorage.getItem('total');
              localStorage.setItem('total', 0);
              return total;
            },
            get_bills: function(project){
              return this.rowData.filter(i => i.project === project)
            },
            upload: () =>{
              document.getElementById('uploader').click();
            },
            hasExtension: (inputID, exts) =>{
                var fileName = document.getElementById(inputID).value;
                return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
            }

        }
}
</script>

<style scoped>
  form{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 40%;
    margin: 0 auto;
    background-color: rgba(67,91,113,.9);
    color: #fff;
    font-family: calibri;
    font-size: 1.2rem;
    border-radius: 10px;
    line-height: 1.428571429;
    padding: 2%
    /*float: left;*/
  }
  h2{
    text-align: left;
  }
</style>