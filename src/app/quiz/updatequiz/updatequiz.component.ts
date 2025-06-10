import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
 
@Component({
  selector: 'app-updatequiz',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './updatequiz.component.html',
  styleUrls: ['./updatequiz.component.css']
})
export class UpdateQuizComponent implements OnInit {
  quizForm!: FormGroup;
  quizId!: number;
 
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}
 
  ngOnInit(): void {
    this.quizId = +this.route.snapshot.params['quizId']; // Retrieve quizId from route
    if (!this.quizId) {
      alert('Invalid quiz ID.');
      this.router.navigate(['/quizlist']); // Redirect to quiz list if quizId is invalid
      return;
    }
 
    this.quizForm = this.fb.group({
      courseId: [{ value: '', disabled: true }, Validators.required], // Disable courseId field
      questions: this.fb.array([]),
      totalMarks: [0, [Validators.required, Validators.min(1)]]
    });
 
    this.loadQuiz(this.quizId); // Load quiz data for editing
 
    // Subscribe to changes in the questions array to update total marks dynamically
    this.questions.valueChanges.subscribe(() => {
      this.updateTotalMarks();
    });
  }
 
  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }
 
  getOptions(questionIndex: number): FormArray {
    const questionsArray = this.quizForm.get('questions') as FormArray;
    return questionsArray.at(questionIndex).get('options') as FormArray;
  }
 
  loadQuiz(quizId: number): void {
    this.http.get(`http://localhost:9091/quiz/getById/${quizId}`, { headers: this.getAuthHeaders() }).subscribe({
      next: (response: any) => {
        const quiz = response.quiz;
 
        this.quizForm.patchValue({
          courseId: quiz.courseId
        });
 
        quiz.questions.forEach((questionText: string, index: number) => {
          const questionGroup = this.fb.group({
            questionText: [questionText, Validators.required],
            options: this.fb.array(
              quiz.options[index].map((option: string) => this.fb.control(option, Validators.required))
            ),
            correctAnswer: [quiz.correctAnswer[index], Validators.required]
          });
          this.questions.push(questionGroup);
        });
 
        this.updateTotalMarks(); // Automatically set total marks
      },
      error: (error) => {
        console.error('Error loading quiz:', error);
        alert('Failed to load quiz. Please try again later.');
      }
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
  }
 
  removeQuestion(index: number): void {
    const questionsArray = this.quizForm.get('questions') as FormArray;
    questionsArray.removeAt(index);
  }
 
  updateTotalMarks(): void {
    const totalQuestions = this.questions.length;
    this.quizForm.patchValue({ totalMarks: totalQuestions }); // Assuming each question is worth 1 mark
  }
 
  updateQuiz(): void {
    if (this.quizForm.valid) {
      const formData = this.quizForm.value;
 
      // Explicitly retrieve the courseId value since it's disabled in the form
      const courseId = this.quizForm.get('courseId')?.value;
 
      // Map the form data to match the backend's expected structure
      const quizData = {
        quizId: this.quizId, // Include quizId for updates
        courseId: courseId, // Explicitly include courseId
        questions: formData.questions.map((q: any) => q.questionText), // Extract questionText as an array of strings
        options: formData.questions.map((q: any) => q.options), // Extract options as an array of arrays
        correctAnswer: formData.questions.map((q: any) => q.correctAnswer), // Extract correctAnswer as an array of strings
        totalMarks: formData.totalMarks
      };
 
      console.log('Course ID:', quizData.courseId); // Debug log for courseId
      console.log('Updated Quiz Data:', quizData); // Debug log for quiz data
 
      this.http.put('http://localhost:9091/quiz/update', quizData, { headers: this.getAuthHeaders(), responseType: 'text' }).subscribe({
        next: () => {
          alert('Quiz updated successfully!');
          this.router.navigate(['/quizlist']); // Redirect to quiz list after update
        },
        error: (error: any) => {
          console.error('Error updating quiz:', error);
          alert('Failed to update quiz. Please try again later.');
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
      'Authorization': `Bearer ${token}` // Attach JWT token to Authorization header
    });
  }
}
 