import { Routes } from '@angular/router';
import { LandingpageComponent } from './landingpage/landingpage.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { CourseComponent } from './course/course.component';
import { EnrollmentsComponent } from './enrollments/enrollments.component';
import { AddquizComponent } from './quiz/addquiz/addquiz.component';
import { QuizlistComponent } from './quiz/quizlist/quizlist.component';
import { QuizAttemptComponent } from './quiz/quizattempt/quizattempt.component';
import { PerformenceComponent } from './performence/performence.component';
import { ContentComponent } from './content/content.component';
import { UpdateQuizComponent } from './quiz/updatequiz/updatequiz.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
    { path: '', component: LandingpageComponent }, 
    { path: 'courses', component: CourseComponent, canActivate: [AuthGuard] },
    { path: 'enrollments', component: EnrollmentsComponent,canActivate: [AuthGuard]},
    { path: 'addquiz/:courseId', component: AddquizComponent,canActivate: [AuthGuard]},
    { path: 'quizzes/:courseId', component: QuizlistComponent,canActivate: [AuthGuard]},
    { path: 'quizattempt/:quizId/:courseId/:userId', component:QuizAttemptComponent,canActivate: [AuthGuard] },
    { path: 'content/:courseId', component: ContentComponent,canActivate: [AuthGuard] },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'updatequiz/:quizId', component: UpdateQuizComponent,canActivate: [AuthGuard] },
    { path: 'performence', component: PerformenceComponent,canActivate: [AuthGuard] },
    { path: '**', redirectTo: '' }
];
