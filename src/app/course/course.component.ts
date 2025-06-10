import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CourseService } from '../course.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit {
  courses: any[] = [];
  courseForm!: FormGroup;
  updateCourseForm!: FormGroup;
  selectedCourse: any = null;
  selectedCourseId: number | null = null;
  enrollments: any[] = [];
  enrollmentCount: number = 0;
  username: string | null = null;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username');
    if (!this.username) {
      console.error('Username is missing in localStorage.');
      alert('You are not authenticated. Please log in.');
    }

    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]],
      category: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      instructorName: [this.username, Validators.required],
      content: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(1000)]]
    });

    this.updateCourseForm = this.fb.group({
      courseId: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]],
      category: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      instructorName: [this.username, Validators.required],
      content: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(1000)]]
    });

    this.loadCourses();
  }

  loadCourses(): void {
    this.courseService.loadCourses().subscribe({
      next: (response: any) => {
        console.log('Courses loaded:', response);
        this.courses = response;
      },
      error: (error: any) => {
        console.error('Error loading courses:', error);
        alert('Failed to load courses. Please try again later.');
      }
    });
  }

  onAddCourse(): void {
    if (this.courseForm.valid) {
      const courseData = this.courseForm.value;
      this.courseService.addCourse(courseData).subscribe({
        next: (response: any) => {
          console.log('Course added successfully:', response);
          alert('Course added successfully!');
          this.loadCourses();
          this.courseForm.reset();
        },
        error: (error: any) => {
          console.error('Error adding course:', error);
          alert('Failed to add course. Please try again later.');
        }
      });
    }
  }

  onEditCourse(course: any): void {
    this.selectedCourse = course;
    this.updateCourseForm.patchValue(course);
  }

  onUpdateCourse(): void {
    if (this.updateCourseForm.valid) {
      const courseData = this.updateCourseForm.value;
      this.courseService.updateCourse(courseData).subscribe({
        next: (response: any) => {
          console.log('Course updated successfully:', response);
          this.loadCourses();
          this.selectedCourse = null;
          this.updateCourseForm.reset();
        },
        error: (error: any) => {
          console.error('Error updating course:', error);
          alert('Failed to update course. Please try again later.');
        }
      });
    }
  }

  onDeleteCourse(courseId: number): void {
    const course = this.courses.find(c => c.courseId === courseId);
    if (course) {
      if (course.instructorName === this.username) {
        this.courseService.deleteCourse(courseId).subscribe({
          next: (response: any) => {
            console.log('Course deleted successfully:', response);
            alert('Course deleted successfully!');
            this.loadCourses();
          },
          error: (error: any) => {
            console.error('Error deleting course:', error);
            alert('Failed to delete course. Please try again later.');
          }
        });
      } else {
        alert('You can only delete courses you created.');
      }
    } else {
      alert('Course not found.');
    }
  }

  onEnroll(course: any): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('You are not authenticated. Please log in.');
      return;
    }

    const enrollmentData = {
      userId: parseInt(userId, 10),
      courseId: course.courseId
    };

    this.courseService.enrollInCourse(enrollmentData).subscribe({
      next: (response: any) => {
        alert(response);
      },
      error: (error: any) => {
        console.error('Error enrolling in course:', error);
        alert('Failed to enroll in course. Please try again later.');
      }
    });
  }

  onViewEngagement(courseId: number): void {
    this.selectedCourseId = courseId;
    this.courseService.getEnrollmentsByCourseId(courseId).subscribe({
      next: (response: any) => {
        this.enrollments = response;
        this.enrollmentCount = response.length;
      },
      error: (error: any) => {
        console.error('Error fetching enrollments:', error);
        alert('Failed to load enrollments. Please try again later.');
      }
    });
  }

  hasRole(role: string): boolean {
    const roles = localStorage.getItem('roles');
    return roles ? roles.split(',').includes(role) : false;
  }

  onCreateQuiz(courseId: number): void {
    console.log('Navigating to create quiz for course ID:', courseId);
    this.router.navigate(['/addquiz', courseId]);
  }

  onManageQuiz(courseId: number): void {
    console.log('Navigating to manage quizzes for course ID:', courseId);
    this.router.navigate(['/quizzes', courseId]);
  }
}