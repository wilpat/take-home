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

    <section class="container" v-for="(project, index) in projects" :key="index">
      <h2 class="title is-2">{{ project }}</h2>
      <b-table
        :data="group_by_employee(get_sheets(project))"
        ref="table"
        detailed
        hoverable
        custom-detail-row
        :opened-detailed="['1']"
        :default-sort="['employee_id', 'asc']"
        detail-key="employee_id"
        @details-open="(row, index) => $toast.open(`Expanded Employee ID ${row.employee_id}`)"
        :show-detail-icon="showDetailIcon">

        <template slot-scope="props">
            <b-table-column
                field="employee_id"
                :visible="columnsVisible['employee_id'].display"
                :label="columnsVisible['employee_id'].title"
                width="300"
                sortable
            >
                <template v-if="!showDetailIcon">
                    {{ props.row.employee_id }}
                </template>
                <template v-else>
                    <a @click="toggle(props.row)">
                        {{ props.row.employee_id }}
                    </a>
                </template>
            </b-table-column>

            <b-table-column
                field="hours"
                :visible="columnsVisible['hours'].display"
                :label="columnsVisible['hours'].title"
                sortable
                centered
            >
                {{ get_total_time(props.row.employee_id, get_sheets(project)) }}
            </b-table-column>

            <b-table-column
                field="rate_per_hour"
                :visible="columnsVisible['rate_per_hour'].display"
                :label="columnsVisible['rate_per_hour'].title"
                sortable
                centered
            >
                {{ formatNumber( props.row.rate_per_hour ) }}
            </b-table-column>

            <b-table-column
                :visible="columnsVisible['cost'].display"
                :label="columnsVisible['cost'].title"
                centered
            >
              {{ formatNumber(props.row.rate_per_hour * get_total_time(props.row.employee_id, get_sheets(project))) }}
            </b-table-column>
        </template>

        <template slot="detail" slot-scope="props">
            <tr v-for="item in get_individual_sheets(props.row.employee_id, get_sheets(project))">
                <td v-if="showDetailIcon"></td>
                <td v-show="columnsVisible['employee_id'].display" >&nbsp;&nbsp;&nbsp;&nbsp;{{ item.employee_id }}</td>
                <td v-show="columnsVisible['hours'].display" class="has-text-centered">{{ time_difference(item.start_time, item.end_time) }}</td>
                <td v-show="columnsVisible['rate_per_hour'].display" class="has-text-centered">{{ formatNumber( item.rate_per_hour ) }}</td>
                <td v-show="columnsVisible['cost'].display" class="has-text-centered">
                   {{ formatNumber( item.rate_per_hour * time_difference(item.start_time, item.end_time) ) }}
                </td>
            </tr>
        </template>

        <template slot="footer" v-if="!isCustom">
            <div class="has-text-right">
                Total : {{ formatNumber( get_total(get_sheets(project)) )}}
            </div>
        </template>
        

      </b-table>
      
    </section>
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
      row_data: [],
      projects: [],
      button_text: 'Choose',
      columnsVisible: {
          employee_id: { title: 'Employee ID', display: true },
          hours: { title: 'Number of Hours', display: true },
          rate_per_hour: { title: 'Unit Price', display: true },
          cost: { title: 'Cost', display: true },
      },
      showDetailIcon: true,
      isCustom: false
    }
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
          // console.log(document.getElementById('uploader').value);

          await this.createInput(files[0]);
      },


      /**
       * Reads the selected file and populates the variables needed for rendering
       */
      createInput: async function(file) {
          var reader = new FileReader();
          await reader.readAsDataURL(file);
          reader.onload = () => {
            this.fileUrl = reader.result;
            d3.csv(this.fileUrl, async (error, data) => {
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
              let { cleaned_data, projects }  = await this.preprocess(data);
              await this.set_variables(cleaned_data, projects, file.name, 'Choose another');
            });
          }
      },

      /**
       * Get the total time spent by an employee on a project
       * @param int employee_id, {object} sheets
       * 
       */
      get_total_time: function(employee_id, sheets){
        let individual_sheets = this.get_individual_sheets(employee_id, sheets);
        let hours = individual_sheets.reduce((acc,sheet) => {
          let diff = this.time_difference(sheet.start_time, sheet.end_time);
          return acc + diff;
        },0)
        return hours;
      },

      /**
       * Get the sheets of an employee
       * @param int employee_id, {object} sheets
       * 
       */
      get_individual_sheets: function(employee_id, sheets) {
        return sheets.filter(sheet => sheet.employee_id == employee_id);
      },

      /**
       * Group the sheets by the employer
       * @param {object} sheets
       * 
       */
      group_by_employee: function(individual_project_sheets){
        let unique = [];
        let grouped_sheets = individual_project_sheets.filter(value => {
          if(!unique.includes(value.employee_id)){
            unique.push(value.employee_id);
            // console.log(unique)
            return true;
          }else{
            return false;
          }
        })
        return grouped_sheets;
      },


      /**
       * Populates the variables needed for rendering
       * @param [array] data, [array] projects, "string" file_name, "string" button_text
       * 
       */
      set_variables: function(data, projects, file_name, button_text){
        this.projects = new Set(projects);
        this.row_data = data;
        this.file_name = file_name;
        this.button_text = button_text
      },

      /**
       * Cleans up the data for rendering
       * @param {object} data
       * @return {object} cleaned data, [array] projects
       */
      preprocess: (data) => {
        const replacements = {
        'Employee ID': 'employee_id', 
        'Billable Rate (per hour)': 'rate_per_hour',
        'Project': 'project',
        'Date': 'date',
        'Start Time': 'start_time',
        'End Time': 'end_time'};
        let projects = [];
        let cleaned_data = data.map(row =>{
          projects.push(row.Project);
          let replacedItems = Object.keys(row).map((key) => {
            const newKey = replacements[key] || key;
            return { [newKey] : row[key] };
          });
          const newRow = Object.assign({}, ...replacedItems);
          return newRow;
        });
        return {cleaned_data, projects};
      },

      /**
       * Gets the difference in hours between a start and end time
       * @return 'string'
       */
      time_difference: (a,b) =>{
        // console.log(a);
        let time1 = a.split(':');
        let time2 = b.split(':');
        let date1 = new Date(0, 0, 0, time1[0], time1[1]);
        let date2 = new Date(0, 0, 0, time2[0], time2[1]);
        var difference = new Date(date2 - date1);
        return difference.getUTCHours();
      },

      /**
       * Gets the total cost billable for a project
       * @return 'string'
       */
      get_total: function(bills){
        // console.log(bills)
        let total = bills.reduce((acc,bill) => {
          let diff = this.time_difference(bill.start_time, bill.end_time);
          let cost = diff * bill.rate_per_hour;
          return cost + acc;
        },0)
        return total;
      },

      /**
       * Gets the recorded timesheets of a particular project
       * @return [array]
       */
      get_sheets: function(project){
        return this.row_data.filter(i => i.project === project)
      },

      /**
       * Activates the file picker
       */
      upload: () =>{
        document.getElementById('uploader').click();
      },

      /**
       * Validates if the entered file is csv or not
       * @param "string" element_id, [array] extensions
       * @return bool
       */
      hasExtension: (element_id, extensions) =>{
          var fileName = document.getElementById(element_id).value;
          return (new RegExp('(' + extensions.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
      },

      /**
      * Trigger the row toggle function in the b-table component
      */
      toggle: function(row) {
          this.$refs.table.toggleDetails(row)
      },

      /**
      * Format number into currency
      * @param int num
      * @return "string"
      */
      formatNumber: (num) => {
          return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
      }

  }
}
</script>

<style scoped>
  
</style>