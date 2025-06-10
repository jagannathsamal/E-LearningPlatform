import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
 
@Component({
  selector: 'app-addquiz',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './addquiz.component.html',
  styleUrls: ['./addquiz.component.css']
})
export class AddquizComponent implements OnInit {
  quizForm!: FormGroup;
  courseId!: number;
 
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}
 
  ngOnInit(): void {
    const rawParams = this.route.snapshot.params;
    const courseIdParam = rawParams['courseId'];
 
    if (courseIdParam && !isNaN(+courseIdParam)) {
      this.courseId = +courseIdParam;
    } else {
      alert('Invalid courseId parameter.');
      return;
    }
 
    this.quizForm = this.fb.group({
      courseId: [this.courseId, Validators.required],
      questions: this.fb.array([]),
      totalMarks: [0, [Validators.required, Validators.min(1)]]
    });
  }
 
  addQuestion(): void {
    const questionsArray = this.quizForm.get('questions') as FormArray;
    questionsArray.push(
      this.fb.group({
        questionText: ['', Validators.required],
        options: this.fb.array([
          this.fb.control('', Validators.required),
          this.fb.control('', Validators.required),
          this.fb.control('', Validators.required),
          this.fb.control('', Validators.required)
        ]),
        correctAnswer: ['', Validators.required]
      })
    );
    const totalMarksControl = this.quizForm.get('totalMarks');
  if (totalMarksControl) {
    totalMarksControl.setValue(questionsArray.length);
  }
   
  }
 
  removeQuestion(index: number): void {
    const questionsArray = this.quizForm.get('questions') as FormArray;
    questionsArray.removeAt(index);
    const totalMarksControl = this.quizForm.get('totalMarks');
  if (totalMarksControl) {
    totalMarksControl.setValue(questionsArray.length);
  }
  }
 
  getOptions(questionIndex: number): FormArray {
    const questionsArray = this.quizForm.get('questions') as FormArray;
    return questionsArray.at(questionIndex).get('options') as FormArray;
  }
 
  onSubmit(): void {
    if (this.quizForm.valid) {
      const formData = this.quizForm.value;
 
      const MAX_OPTION_LENGTH = 5000;
      const quizData = {
        courseId: formData.courseId,
        questions: formData.questions.map((q: any) => q.questionText),
        options: formData.questions.map((q: any) =>
          q.options.map((option: string) => option.trim().substring(0, MAX_OPTION_LENGTH))
        ), // Trim and truncate options
        correctAnswer: formData.questions.map((q: any) => q.correctAnswer),
        totalMarks: formData.totalMarks
      };
 
      console.log('Quiz Data:', quizData); // Debug log for quiz data
 
      this.http.post('http://localhost:9091/quiz/save', quizData, { headers: this.getAuthHeaders(), responseType: 'text' }).subscribe({
        next: () => {
          alert('Quiz created successfully!');
          this.quizForm.reset();
        },
        error: (error: any) => {
          console.error('Error creating quiz:', error);
          alert('Failed to create quiz. Please try again later.');
        }
      });
    } else {
      alert('Please fill out all required fields.');
    }
  }
 
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      alert('You are not authenticated. Please log in.');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
 
  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }
}
 