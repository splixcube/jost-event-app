import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { DialogService } from 'primeng/dynamicdialog';

import * as XLSX from 'xlsx';
import { VerifyOptComponent } from 'src/app/shared/verify-opt/verify-opt.component';
import { Table } from 'primeng/table';
import { AddEmployeeComponent } from 'src/app/shared/add-employee/add-employee.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import * as FileSaver from 'file-saver';
@Component({
  selector: 'app-manage-employee',
  templateUrl: './manage-employee.component.html',
  styleUrls: ['./manage-employee.component.scss'],
})
export class ManageEmployeeComponent {
  cityData:any=null
  selectedEmployees: any =[];
  importcolumns = [
    'SrNo',
    'EmployeeCode',
    'EmployeeName',
    'BusinessUnit',
    'DepartmentName',
    'MobileNo',
    'SportName',
    'SportType',
    'EventId',
    'JerseyType',
    'JerseySize',
    'Location',
    'LocationCode',
    'AppliedDate',
    'Status',
    'StatusOn',
    'TeamName'
  ];
  exportColumns: any[] = [
    { field: 'EmployeeCode', header: 'Employee Code' },
    { field: 'EmployeeName', header: 'Employee Name' },
     { field: 'BusinessUnit', header: 'Business Unit' },
    { field: 'DepartmentName', header: 'Department Name' },
    { field: 'MobileNo', header: 'MobileNo' },
    { field: 'SportName', header: 'Sport Name' },
    { field: 'SportType', header: 'Sport Type' },
   { field: 'TeamName', header: 'Team Name' },
    { field: 'EventId', header: 'EventId' },
    { field: 'JerseyType', header: 'Jersey Type' },
    { field: 'JerseySize', header: 'Jersey Size' },
       { field: 'LocationCode', header: 'Location Code' },
    { field: 'Location', header: 'Location' },
       { field: 'UserCity', header: 'City' },
          { field: 'State', header: 'State' },
             { field: 'Region', header: 'Region' },
    { field: 'AppliedDate', header: 'Applied Date' },
    { field: 'Status', header: 'Status' },
    { field: 'StatusOn', header: 'Status On' },
   
    { field: 'registered', header: 'Registered',hide:false },
    { field: 'verified', header: 'Verified',hide:false  },
  ];
  cityId:any;
  employees: any = [];

  checkDeletePermision:any='false';
  constructor(
    public route: ActivatedRoute,
    public db: AngularFirestore,
    public dialogService: DialogService,
    public confirmationService: ConfirmationService,
    public messageService: MessageService
  ) {

    this.cityId = this.route.snapshot.paramMap.get('id');
    this.db.collection("cities").doc(this.cityId).get().subscribe(res=>{
      this.cityData=res.data()
    })
    this.getAllEmployees();
    this.checkDeletePermision=localStorage.getItem('isAdminReadonly')||'false'
  }


  getAllEmployees() {
    this.db
      .collection('employees', (ref) => ref.where('city', '==', this.cityId))
      .snapshotChanges()
      .pipe(
        map((actions: any) =>
          actions.map((a: any) => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      )
      .subscribe((res) => {
        this.employees = res;
      });
  }

  onFileChange(event: any) {
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }

    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(target.files[0]);
    reader.onload = async (e: any) => {
      /* create workbook */
      const binarystr: string = e.target.result;
      try {
        const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });

        /* selected the first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        /* save data */
        const data: any = XLSX.utils.sheet_to_json(ws); // to get 2d array pass 2nd parameter as object {header: 1}
       
        if (data && data.length > 0 && data[0]) {
          let excelData = data.map((item: any) => {
           return {
              city: this.cityId || '',
              registered: false,
              verified: false,
              SrNo: item.SrNo || '',
             EmployeeCode: item.EmployeeCode || item['Employee Code'] || '',
             EmployeeName: item.EmployeeName || item['Employee Name'] || '',
             BusinessUnit: item.BusinessUnit || item['Business Unit'] || '',
             DepartmentName: item.DepartmentName || item['Department Name'] || '',
             MobileNo: item.MobileNo || '',
             SportName: item.SportName || item['Sport Name'] || '',
             SportType: item.SportType || item['Sport Type'] || '',
             TeamName: item.TeamName || item['Team Name'] || '',
             EventId: item.EventId || item['Event Id'] || '',
             JerseyType: item.JerseyType || '',
             JerseySize: item.JerseySize || '',
             LocationCode: item.LocationCode || item['Location Code'] || '',
             Location: item.Location || '',
             UserCity: item.City || item['UserCity']  || '',
             State: item.State || '',
             Region: item.Region || '',
             AppliedDate: this.formatDateString(item.AppliedDate, 'iso') || '',
             Status: item.Status || '',
             StatusOn: this.formatDateString(item.StatusOn, 'iso') || '',
            };
          });
          await this.bulkImport(excelData);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Imported Successfully',
          });
          event.target.value = null;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Invalid  Excel Format',
          });
          event.target.value = null;
        }
      } catch (err) {
        console.log(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Invalid File Format',
        });
        event.target.value = null;
      }
    };
  }

  async bulkImport(data: any) {
    return new Promise((resolve, reject) => {
      this.addQueryBatch(data, resolve).catch(reject);
    });
  }

  async addQueryBatch(contacts: any, resolve: any) {
    const chunkSize = 490; // Adjust the chunk size as needed
    for (let i = 0; i < contacts.length; i += chunkSize) {
      const chunk = contacts.slice(i, i + chunkSize);
      const batch = this.db.firestore.batch();
      for await (const iterator of chunk) {
        const docRef = this.db
          .collection('employees')
          .doc(this.db.createId()).ref;
        const timestamp: any = new Date();
        iterator.timestamp = timestamp;
        batch.set(docRef, iterator);
      }
      await batch.commit();
    }
    resolve();
  }
played(data:any){
 this.db.collection('employees').doc(data.id).update({ played: true });
}
  verify(id: any) {
    // code to verify otp and call this function
    this.db.collection('employees').doc(id).update({ verified: true });
  }

  registerEmployee(id: any) {
    // code to verify otp and call this function
    this.db.collection('employees').doc(id).update({ registered: true });
  }

  dismiss() {}

  verifyOTP(data: any) {
    this.verify(data.id);
   /*  const ref = this.dialogService.open(VerifyOptComponent, {
      data: {
        ...data,
        type: 'verificationCode',
      },
      header: 'Verify OTP',
      width: '35%',
    });
    ref.onClose.subscribe((res: any) => {
      if (res && res.verified) {
        this.verify(res.id);
      }
    }); */
  }

  register(data: any) {
  const ref = this.dialogService.open(VerifyOptComponent, {
      data: {
        ...data,
        type: 'registrationCode',
      },
      header: 'Verify OTP',
      width: '35%',
    });
    ref.onClose.subscribe((res: any) => {
      if (res && res.verified) {
        this.registerEmployee(res.id);
      }
    }); 
  }

  deleteRow(id: any) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.deleteEmployee(id);
      },
    });
  }

  deleteEmployee(id: any) {
    this.db.collection('employees').doc(id).delete();
  }

  deleteSelectedRows() {
    if (!this.selectedEmployees || this.selectedEmployees.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No rows selected for deletion',
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${this.selectedEmployees.length} selected employee(s)? This action cannot be undone.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteSelectedEmployees();
      },
    });
  }

  async deleteSelectedEmployees() {
    try {
      const batch = this.db.firestore.batch();
      
      this.selectedEmployees.forEach((employee: any) => {
        const docRef = this.db.collection('employees').doc(employee.id).ref;
        batch.delete(docRef);
      });

      await batch.commit();
      
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: `${this.selectedEmployees.length} employee(s) deleted successfully`,
      });
      
      // Clear selection after deletion
      this.selectedEmployees = [];
      
    } catch (error) {
      console.error('Error deleting employees:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete selected employees',
      });
    }
  }

  clear(table: Table, inp: any) {
    inp.value = '';
    table.clear();
  }

  clearSelection() {
    this.selectedEmployees = [];
  }
  selectRow(rowData: any) {
    if(this.selectedEmployees.some((selected: any) => selected.id === rowData.id)) {
      this.selectedEmployees = this.selectedEmployees.filter((selected: any) => selected.id !== rowData.id);
    }
    else {
      this.selectedEmployees.push(rowData);
    }
  }

  isAllSelected(): boolean {
    return this.employees.length > 0 && this.selectedEmployees.length === this.employees.length;
  }

  isIndeterminate(): boolean {
    return this.selectedEmployees.length > 0 && this.selectedEmployees.length < this.employees.length;
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      // If all are selected, deselect all
      this.selectedEmployees = [];
    } else {
      // If not all are selected, select all
      this.selectedEmployees = [...this.employees];
    }
  }

  isRowSelected(rowData: any): boolean {
    return this.selectedEmployees && this.selectedEmployees.some((selected: any) => selected.id === rowData.id);
  }

  edit(data: any) {
    data.city = this.cityId;
    const ref = this.dialogService.open(AddEmployeeComponent, {
      data: data,
      header: 'Edit Employee',
      width: '85%',
    });
    ref.onClose.subscribe((res: any) => {
      if (res && res?.added) {
      }
    });
  }

  add() {
    const ref = this.dialogService.open(AddEmployeeComponent, {
      data: this.cityId,
      header: 'Add Employee',
      width: '85%',
    });
    ref.onClose.subscribe((res: any) => {
      if (res && res?.added) {
      }
    });
  }

  import() {
    document.getElementById('fileinp')?.click();
  }



  exportExcel(table: Table) {
   
    let filteredData:any
     if(this.selectedEmployees?.length>0) {
      filteredData=table.selection.map((item:any)=>{
        let obj:any={}
         if(item.registered && item.verified && item.played){
             obj['status']='Played'
          }
            if(item.registered && item.verified && !item.played){
               obj['status']='Attended'
          }
            if(item.registered && !item.verified){
             obj['status']='Registered'
          }
            if(!item.registered && !item.verified){
               obj['status']='Pending'
          }
        this.exportColumns.forEach((column)=>{
          obj[column.field]=item[column.field]
        })
        return obj
      })
     }
     else {
       filteredData=(table.filteredValue ? table.filteredValue : table.value).map((item)=>{
        let obj:any={}
        this.exportColumns.forEach((column)=>{
          //add new field
          
          if(item.registered && item.verified && item.played){
             obj['status']='Played'
          }
            if(item.registered && item.verified && !item.played){
               obj['status']='Attended'
          }
            if(item.registered && !item.verified){
             obj['status']='Registered'
          }
            if(!item.registered && !item.verified){
               obj['status']='Pending'
          }

          if(column.field=='registered' || column.field=='verified' ) {
            obj[column.field]=item[column.field] ? 'Yes' : 'No'
          }
           if(column.field=='UserCity' ) {
            obj['City']=item['UserCity'] || ''
          } 
          else {
            obj[column.field]=item[column.field]
          }

        })
        return obj
      })
     }

// return
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(filteredData);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "Employee-Data");
    });
}

saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
}

formatDateString(dateTimeString:any, format = 'default') {
  // Return empty string if no date provided
  if (!dateTimeString) {
    return '';
  }
  
  let date: Date;
  
  // Check if it's an Excel serial number (numeric)
  if (typeof dateTimeString === 'number') {
    // Excel date serial number - Excel's epoch is 1900-01-01
    // But Excel incorrectly treats 1900 as a leap year, so we need to adjust
    const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
    const days = Math.floor(dateTimeString);
    const time = (dateTimeString - days) * 24; // Convert decimal part to hours
    
    // Excel incorrectly counts 1900 as leap year, so subtract 1 if date > 59
    const adjustedDays = dateTimeString > 59 ? days - 1 : days;
    
    date = new Date(excelEpoch.getTime() + (adjustedDays - 2) * 24 * 60 * 60 * 1000);
    
    // Add the time component with proper precision
    const hours = Math.floor(time);
    const minutes = Math.floor((time - hours) * 60);
    const seconds = Math.floor(((time - hours) * 60 - minutes) * 60);
    const milliseconds = Math.floor((((time - hours) * 60 - minutes) * 60 - seconds) * 1000);
    
    date.setHours(hours, minutes, seconds, milliseconds);
  } else if (typeof dateTimeString === 'string') {
    // Handle string format "dd-mm-yyyy hh:mm"
    if (dateTimeString.includes(' ') && dateTimeString.includes('-')) {
      const [datePart, timePart] = dateTimeString.split(' ');
      const [day, month, year] = datePart.split('-');
      const timeComponents = timePart.split(':');
      const hours = parseInt(timeComponents[0]) || 0;
      const minutes = parseInt(timeComponents[1]) || 0;
      const seconds = parseInt(timeComponents[2]) || 0;
      
      // Create Date object (month is 0-indexed)
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hours, minutes, seconds);
    } else {
      // Try to parse as regular date string
      date = new Date(dateTimeString);
    }
  } else {
    // Fallback to current date
    date = new Date();
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid date:', dateTimeString);
    return '';
  }
  // Add 1 day to the date
  if(typeof dateTimeString ==='number') {
    date.setDate(date.getDate() + 1);
  }
 // date.setDate(date.getDate() + 1);
  
  // Format options
  switch (format.toLowerCase()) {
    case 'iso':
      const isoString = date.toISOString();
      return isoString;
    
    case 'us':
      return date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US');
    
    case 'uk':
      return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB');
    
    case 'short':
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    
    case 'long':
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    
    case 'time':
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    
    case 'date':
      return date.toLocaleDateString('en-US');
    
    case 'yyyy-mm-dd':
      return date.toISOString().split('T')[0];
    
    case 'dd/mm/yyyy':
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    
    case 'custom':
      // Custom format: "October 29, 2024 at 4:48 PM"
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) + ' at ' + date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    
    default:
      return date.toString();
  }
}
}
