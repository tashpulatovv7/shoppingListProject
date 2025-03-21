import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { registerMutation } = useAuth();

  const onSubmit = (data) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Register</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label>Name</label>
            <input 
              type="text" 
              {...register("name", { required: "Name is required" })} 
              placeholder="Enter your name" 
            />
            {errors.name && <p className="error">{errors.name.message}</p>}
          </div>

          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              {...register("username", { required: "Username is required" })} 
              placeholder="Enter your username" 
            />
            {errors.username && <p className="error">{errors.username.message}</p>}
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })} 
              placeholder="Enter your password" 
            />
            {errors.password && <p className="error">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? "Loading..." : "Sign Up"}
          </button>
        </form>
        
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
