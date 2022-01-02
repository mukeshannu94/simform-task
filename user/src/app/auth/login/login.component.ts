import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../core/services/user.service';
import { JwtService } from '../../core/services/jwt.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private jwtService: JwtService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.email],
      password: ['', Validators.required]
    });
   }

  ngOnInit(): void {

  }
  login(): void {
    this.spinner.show();
    this.userService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.jwtService.saveToken(res.data.token);
          this.toastr.success('Welcome');
          this.router.navigate(['/users']);
        } else {
          this.toastr.error(res.message);
        }
      }, error: (err) => {
        this.spinner.hide();
        this.toastr.error('Something went wrong');
      }
    });
  }

}
