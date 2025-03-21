import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { loginMutation } = useAuth();

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
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
              {...register("password", { required: "Password is required" })} 
              placeholder="Enter your password" 
            />
            {errors.password && <p className="error">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Loading..." : "Login"}
          </button>
        </form>
        
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
