import { AfterViewInit, Component, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Router } from '@angular/router';
import { UserService } from '../core/services/user.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../environments/environment';
import { JwtService } from '../core/services/jwt.service';

declare var $: any;

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtOptions: any = {};
  status = '0,1';
  dtTrigger: Subject<any> = new Subject();
  listener: any;
  userEditForm!: FormGroup;
  isSubmitted: boolean = false;
  selectedFile!: any;
  userData: any = {};
  constructor(
    private router: Router,
    private userService: UserService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private pipe: DatePipe,
    private renderer: Renderer2,
    private fb: FormBuilder,
    private jwtService: JwtService,
  ) {
    this.userEditForm = this.fb.group({
      _id: ['', Validators.required],
      firstName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
      email: ['', [Validators.required, Validators.pattern(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/)]],
      password: ['', [Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/)]],
      status: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.userData = this.jwtService.getUserData();
    this.usersList();
  }
  onFileChanged(e: any) {
    const file = e.target.files[0];
    if (file.type.split("/")[0] == 'image' && (file.name.split('.').pop() === 'jpeg' || file.name.split('.').pop() === 'jpg' || file.name.split('.').pop() === 'png')) {
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
      this.toastr.error('Invalid File Format', 'Error');
    }
  }
  editUser(id: any): void {
    this.spinner.show();
    this.userService.userDetail(id).subscribe({
      next: (res) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          $('#editUserModal').modal('show');
          this.userEditForm.patchValue(res.data.user);
        } else {
          this.toastr.error(res.message, 'Error');
        }
      }
      , error: (err) => {
        this.spinner.hide();
        this.toastr.error('Something went wrong', 'Error');
      }
    });
  }
  updateUser(): void {
    this.spinner.show();
    var formData = new FormData();
    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile ? this.selectedFile : null, this.selectedFile ? this.selectedFile.name : null);
    }
    formData.append('firstName', this.userEditForm.value.firstName);
    formData.append('lastName', this.userEditForm.value.lastName);
    formData.append('email', this.userEditForm.value.email);
    formData.append('password', this.userEditForm.value.password);
    formData.append('status', this.userEditForm.value.status);
    this.userService.updateUser(formData, this.userEditForm.value._id).subscribe(res => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        $('#editUserModal').modal('hide');
        this.toastr.success(res.message);
        this.rerender();
      } else {
        this.toastr.error(res.message, 'Error');
      }
    }, (err) => {
      this.spinner.hide();
      this.toastr.error(err.message, 'Error');
    });
  }
  usersList(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: false,
      order: [4, 'desc'],
      ajax: (dataTablesParameters: any, callback: any) => {
        this.spinner.show();
        dataTablesParameters.status = this.status.split(',');
        this.userService.usersList(dataTablesParameters).subscribe({
          next: (res) => {
            this.spinner.hide();
            if (res.statusCode === 200) {
              callback({
                recordsTotal: res.data.recordsTotal,
                recordsFiltered: res.data.recordsFiltered,
                data: res.data.users
              });
            } else {
              this.spinner.hide();
              this.toastr.error(res.message, 'Error');
            }
          }
          , error: (err) => {
            callback({
              recordsTotal: 0,
              recordsFiltered: [],
              data: []
            });
            this.spinner.hide();
            this.toastr.error('Something Went Wrong!', 'Error');
          }
        });
      },
      columns: [
        { title: 'First&nbsp;Name', data: 'firstName', name: 'firstName', orderable: true },
        { title: 'Last&nbsp;Name', data: 'lastName', name: 'lastName', orderable: true },
        { title: 'Email', data: 'email', name: 'email', orderable: false },
        { title: 'Status', data: 'status', name: 'status', render: (status: number) => { return status == 1 ? '<p class="text-success">Active</p>' : '<p class="text-danger">Inactive</p>' } },
        { title: 'Created&nbsp;On', data: 'createdAt', searchable: false, name: 'createdAt', render: (createdAt: string, type: any, full: any) => this.pipe.transform(full.createdAt, 'short') },
        { title: 'Updated&nbsp;On', data: 'updatedAt', searchable: false, name: 'updatedAt', render: (updatedAt: string, type: any, full: any) => this.pipe.transform(full.updatedAt, 'short') },
        {
          title: 'Action', data: '_id', name: '_id', orderable: false, searchable: false, render(id: string, type: any, full: any): any {
            return `
            <a href="javascript:void(0)">
               <i class="fas fa-edit" title="Edit" edit-user-id=` + id + `>
            </i>
            </a>
          `;
          }
        },
        {
          title: 'Profile Image', data: '_id', searchable: false, name: 'profileImage', class: 'none', orderable: false, render(profileImage: string, type: any, full: any): any {
            let resource = '';
            if (full.profileImage) {
              resource = `<img style="max-width:100%" src=` + environment.api_url + '/uploads/profile/' + full.profileImage + ` />`;
            }
            return resource;
          }
        },
      ],

      responsive: true
    };
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next('');
    this.listener = this.renderer.listen('document', 'click', (event) => {
      if (event.target.hasAttribute("edit-user-id")) {
        this.editUser(event.target.getAttribute('edit-user-id'));
      }
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  rerender(): void {
    document.querySelector('#usersTable')!.innerHTML = ' ';
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next('');
    });
  }

  logout(): void {
    if (confirm('Are you sure want to logout')) {
      this.spinner.show();
      this.userService.logout().subscribe(res => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.jwtService.destroyToken();
          this.router.navigate(['/']);
          this.toastr.success('Logout Success!', 'Success');
        } else {
          this.toastr.error(res.message, 'Error');
        }
      }, (err) => {
        this.spinner.hide();
        this.toastr.error('Something went wrong', 'Error');
      });
    }
  }

}
